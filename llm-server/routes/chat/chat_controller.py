from http import HTTPStatus
from typing import Optional, cast, Dict
import json
from flask import jsonify, Blueprint, request, Response, abort, Request
from models.repository.chat_history_repo import (
    get_all_chat_history_by_session_id_with_total,
    get_session_counts_by_user,
    get_unique_sessions_with_first_message_by_bot_id,
    create_chat_histories,
    get_analytics,
    most_called_actions_by_bot,
)
from models.repository.chat_session_repo import create_session_summary
from models.repository.chat_intent_repo import (
    create_chat_intent,
    get_chat_intent_by_session_id,
)
from models.repository.copilot_repo import find_one_or_fail_by_token
from routes.analytics.analytics_service import upsert_analytics_record
from routes.chat.chat_dto import ChatInput
from routes.chat.helpers import parse_json_intent
from routes.chat.implementation.chain_strategy import ChainStrategy
from routes.chat.implementation.functions_strategy import FunctionStrategy
from routes.chat.implementation.handler_interface import ChatRequestHandler
from routes.chat.implementation.tools_strategy import ToolStrategy
from utils.llm_consts import X_App_Name, chat_strategy, ChatStrategy
from utils.sqlalchemy_objs_to_json_array import sqlalchemy_objs_to_json_array
from utils.get_chat_model import get_chat_model
from flask_socketio import emit

from models.repository.chat_vote_repo import (
    upvote_or_down_vote_message,
)
from utils.get_logger import SilentException


from langchain.schema import HumanMessage, SystemMessage

import openai
import uuid
import os
from werkzeug.exceptions import BadRequest

chat_workflow = Blueprint("chat", __name__)


def get_validated_data(request: Request) -> Optional[dict]:
    data = request.get_json()
    if not data:
        return None

    required_keys = {"app", "system_prompt", "summarization_prompt"}

    if not required_keys.issubset(data.keys()):
        print(
            f"Missing required keys in request: {required_keys.difference(data.keys())}"
        )
        return None

    return data


@chat_workflow.route("/sessions/<session_id>/chats", methods=["GET"])
def get_session_chats(session_id: str) -> Response:
    # Get limit and page from query parameters
    limit = int(request.args.get("limit", 20))
    page = int(request.args.get("page", 1))

    # Calculate offset based on the page number and limit
    offset = (page - 1) * limit

    chats, total_messages = get_all_chat_history_by_session_id_with_total(
        session_id, limit, offset
    )

    chats_filtered = []

    for chat in chats:
        chats_filtered.append(
            {
                "chatbot_id": chat.chatbot_id,
                "created_at": chat.created_at,
                "from_user": chat.from_user,
                "id": chat.id,
                "message": chat.message,
                "session_id": chat.session_id,
                "debug_json": chat.debug_json,
            }
        )

    # Calculate total pages
    total_pages = (total_messages + limit - 1) // limit

    response_data = {"data": chats_filtered, "total_pages": total_pages}

    return jsonify(response_data)


@chat_workflow.route("/b/<bot_id>/chat_sessions", methods=["GET"])
def get_chat_sessions(bot_id: str):
    # Get limit and page from query parameters
    limit = int(request.args.get("limit", 20))
    page = int(request.args.get("page", 1))

    # Calculate offset based on the page number and limit
    offset = (page - 1) * limit

    # Fetch chat sessions based on the calculated offset and limit
    (
        chat_history_sessions,
        total_pages,
    ) = get_unique_sessions_with_first_message_by_bot_id(bot_id, limit, offset)

    return jsonify({"data": chat_history_sessions, "total_pages": total_pages}), 200


@chat_workflow.route("/init", methods=["GET"])
def init_chat():
    bot_token = request.headers.get("X-Bot-Token")
    session_id = request.headers.get("X-Session-Id")

    history = []
    if session_id:
        chats, _ = get_all_chat_history_by_session_id_with_total(session_id, 200, 0)
        history = sqlalchemy_objs_to_json_array(chats) or []
        create_session_summary(session_id)  # Create a new session summary row

    if not bot_token:
        return (
            jsonify(
                {
                    "type": "text",
                    "response": {"text": "Could not find bot token"},
                }
            ),
            404,
        )

    try:
        bot = find_one_or_fail_by_token(bot_token)
        # Replace 'faq' and 'initialQuestions' with actual logic or data as needed.

        if (
            bot.token == "FsQJM4nPZAAEKgqt"
        ):  # todo @shanur let's make this dynamic, for now this is Zid demo

            # Initial list of questions
            initial_questions = [
                "ماذا يمكنك مساعدتي؟",
                "ملخص مبيعات للشهر الماضي",
                "جدول لمقارنة مبيعات الاسبوع الحالي والاسبوع الماضي",
                "كيف ارفع حجم السلة؟",
                "ما هي الفئات الأكثر مبيعاً هذا الشهر؟",
                "كيف يمكننا تحسين معدلات الاحتفاظ بالعملاء؟",
                "ما هي خدمة تمويل زد؟",
                "ساعدني في كتابة وصف لمنتجي",
            ]

        elif bot.website == "https://www.education.govt.nz":
            initial_questions = [
                "Get 2 Current Business Managers",
                "Get Current 3 Data Mangers",
                "Get Current 4 Principals",
                "Get Current 5 Test Administrators",
                "Get Current 3 Superintendents",
                "Get Current Orgs",
            ]
        else:
            initial_questions = []

        return jsonify(
            {
                "bot_name": bot.name,
                "logo": "logo",
                "faq": [],  # Replace with actual FAQ data
                "initial_questions": initial_questions,
                "history": history,
            }
        )
    except Exception as e:
        return Response(status=HTTPStatus.NOT_FOUND, response="Bot Not Found")


async def send_chat_stream(
    message: str,
    bot_token: str,
    session_id: str,
    headers_from_json: Dict[str, str],
    extra_params: Dict[str, str],
    incoming_message_id: str = None,
):
    await handle_chat_send_common(
        message=message,
        bot_token=bot_token,
        session_id=session_id,
        headers_from_json=headers_from_json,
        extra_params=extra_params,
        is_streaming=True,
        incoming_message_id=incoming_message_id,
    )


@chat_workflow.route("/send", methods=["POST"])
async def send_chat():
    json_data = request.get_json()

    input_data = ChatInput(**json_data)
    message = input_data.content
    incoming_message_id = (
        input_data.id or None
    )  # this is the message id from the client (assigned by the client)
    session_id = input_data.session_id
    headers_from_json = input_data.headers or {}
    bot_token = request.headers.get("X-Bot-Token")
    extra_params = json_data.get("extra_params", {})

    if bot_token == "FsQJM4nPZAAEKgqt":
        # check if the message containt the word "salla", سلة, or سله
        if (
            "سلة" in message
            or "سله" in message
            or "salla" in message
            or "Salla" in message
        ):
            # then replace it with "منافس"
            message = (
                message.replace("سلة", "")
                .replace("سله", "")
                .replace("salla", "")
                .replace("Salla", "")
            )

    return await handle_chat_send_common(
        message,
        bot_token,
        session_id,
        headers_from_json,
        extra_params,
        is_streaming=False,
        incoming_message_id=incoming_message_id,
    )


@chat_workflow.route("/webhook/<bot_token>/s/<session_id>", methods=["POST"])
async def webhook_chat(bot_token: str, session_id: str):
    headers_from_json = {}
    json_data = request.get_json()

    return await handle_chat_send_common(
        json.dumps(json_data),
        bot_token,
        session_id,
        headers_from_json,
        is_streaming=False,
        extra_params={},
    )


async def handle_chat_send_common(
    message: str,
    bot_token: Optional[str],
    session_id: str,
    headers_from_json: Dict[str, str],
    extra_params: Dict[str, str],
    is_streaming: bool,
    incoming_message_id: str = None,
):
    app_name = headers_from_json.pop(X_App_Name, None)
    emit(f"{session_id}_info", "⌛⏳⌛⏳⌛⏳⌛")

    if not message:
        abort(400, description="Content cannot be null")

    if not bot_token:
        return Response(response="bot token is required", status=400)

    try:
        bot = find_one_or_fail_by_token(bot_token)
        base_prompt = bot.prompt_message

        strategy: ChatRequestHandler = ChainStrategy()
        if chat_strategy == ChatStrategy.function:
            strategy = FunctionStrategy()

        elif chat_strategy == ChatStrategy.tool:
            strategy = ToolStrategy()

        headers_from_json.update(bot.global_variables or {})

        result = await strategy.handle_request(
            message,
            session_id,
            str(base_prompt),
            bot,
            headers_from_json,
            extra_params,
            app_name,
            is_streaming,
            incoming_message_id,
        )

        # if the llm replied correctly
        if (
            result.message is not None
            or len(result.api_request_response.api_requests) > 0
            or result.error is not None
        ):
            chat_records = [
                {
                    "session_id": session_id,
                    "from_user": True,
                    "message": message,
                },
                {
                    "session_id": session_id,
                    "from_user": False,
                    "message": result.message or result.error,
                    "api_called": result.api_called,
                    "knowledgebase_called": result.knowledgebase_called,
                    "debug_json": result.api_request_response.api_requests,
                },
            ]

            upsert_analytics_record(
                chatbot_id=str(bot.id), successful_operations=1, total_operations=1
            )
            chat_histories = create_chat_histories(str(bot.id), chat_records)

        (
            emit(session_id, "|im_end|")
            if is_streaming
            else jsonify({"type": "text", "response": {"text": result.message}})
        )

        # Return the bot response message id to the client to be used for voting
        if chat_histories and len(chat_histories) > 1:
            emit(f"{session_id}_vote", chat_histories[1].id) if is_streaming else None

        return jsonify({"type": "text", "response": {"text": result.message}})
    except BadRequest as e:
        return (
            jsonify(
                {
                    "type": "text",
                    "response": {"text": f"Bad Request: {e.description}"},
                }
            ),
            400,
        )
    except Exception as e:
        SilentException.capture_exception(e)
        emit(session_id, str(e))
        return (
            jsonify(
                {
                    "type": "text",
                    "response": {
                        "text": f"I'm unable to help you at the moment, please try again later. **code: b500**\n```{e}```"
                    },
                }
            ),
            500,
        )


@chat_workflow.route("/vote/<message_id>", methods=["POST", "DELETE"])
async def vote(message_id: str):
    bot_token = request.headers.get("X-Bot-Token")

    if not message_id:
        return jsonify({"error": "Message ID is required"}), 400

    if not bot_token:
        return Response(response="Invalid bot token prodived", status=400)

    try:
        bot = find_one_or_fail_by_token(bot_token)
        if request.method == "DELETE":
            upvote_or_down_vote_message(
                chatbot_id=bot.id,
                message_id=message_id,
                is_upvote=False,
            )
            return jsonify({"message": "Vote deleted successfully"}), 200
        upvote_or_down_vote_message(
            chatbot_id=bot.id, message_id=message_id, is_upvote=True
        )

    except Exception as e:
        return jsonify({"error": "An error occurred"}), 500
    return jsonify({"message": "Vote added successfully"}), 200


# @Todo convert to chathistory, use a larger model 32k and add trim history, then start caching these conversation intents
@chat_workflow.route("/intents/<session_id>", methods=["GET"])
async def get_conversation_intent(session_id: str):
    histories, _ = get_all_chat_history_by_session_id_with_total(session_id=session_id)
    chat = get_chat_model("get_conversation_intent")

    # caching
    content = get_chat_intent_by_session_id(session_id=session_id)
    if content:
        return jsonify(content.intents)

    messages = []

    messages.append(
        SystemMessage(
            content="You are a ai assistant capable of understanding intents from user input"
        )
    )
    messages.append(
        HumanMessage(
            content="""Given a list of user questions, analyze each question and identify its intent. Each user question is represented as a text string.

Your task is to generate intents for each user question. Each intent should include the 'intent_type' (the identified intent) and 'confidence' (a confidence score for the identification). The output should be in JSON format. You need to dynamically generate the intent types in these user questions. Limit intent types to atmost 4

JSON Format Example:
{
  "intents": [
    {"intent_type": "prices", "confidence": 0.9},
    {"intent_type": "onboarding", "confidence": 0.8},
    ...etc
  ]
}
"""
        )
    )

    # Filter messages sent by the user and add them to the list
    user_messages = []
    for history in histories:
        if bool(history.from_user):
            user_messages.append(HumanMessage(content=str(history.message)))
    messages.extend(user_messages)

    # Invoke the large language model
    result = await chat.ainvoke(messages)
    content = parse_json_intent(cast(str, result.content))

    create_chat_intent(session_id=session_id, intents=content.dict())

    return jsonify(content.dict())


@chat_workflow.route("/submit/<bot_id>", methods=["POST"])
async def submit_ui_form(bot_id: str):
    return jsonify({"message": "Form submitted successfully"}), 200


@chat_workflow.route("/analytics/<bot_id>", methods=["GET"])
def get_analytics_by_email(bot_id: str) -> Response:
    result = get_analytics(bot_id)
    return jsonify(result)


@chat_workflow.route("/sessions/count/<email>", methods=["GET"])
def session_counts_by_user(email: str):
    response = get_session_counts_by_user(email)
    return jsonify(response)


@chat_workflow.route("/actions/most_called/<bot_id>", methods=["GET"])
def m_called_actions_by_bot(bot_id: str):
    response = most_called_actions_by_bot(bot_id)
    return jsonify(response)


@chat_workflow.route("/transcribe", methods=["POST"])
async def transcribe_audio():
    # Check if the post request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.endswith(".m4a") and not file.filename.endswith(".mp3"):
        return jsonify({"error": "Invalid file type"}), 400

    # Generate a random file name
    file_name = "/tmp/audio_" + str(uuid.uuid4()) + ".m4a"
    file.save(file_name)

    transcript = openai.audio.transcriptions.create(
        model="whisper-1", file=open(file_name, "rb"), response_format="text"
    )

    # Clean up the file
    os.remove(file_name)

    return jsonify({"text": transcript})
