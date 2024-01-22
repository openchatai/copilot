from http import HTTPStatus
from typing import Optional
from typing import cast, Dict

from flask import jsonify, Blueprint, request, Response, abort, Request

from models.repository.chat_history_repo import (
    get_all_chat_history_by_session_id_with_total,
    get_unique_sessions_with_first_message_by_bot_id,
    create_chat_histories,
)
from models.repository.copilot_repo import find_one_or_fail_by_token
from routes.analytics.analytics_service import upsert_analytics_record
from routes.chat.chat_dto import ChatInput
from routes.chat.implementation.chain_strategy import ChainStrategy
from routes.chat.implementation.functions_strategy import FunctionStrategy
from routes.chat.implementation.handler_interface import ChatRequestHandler
from routes.chat.implementation.tools_strategy import ToolStrategy
from utils.get_logger import CustomLogger
from utils.llm_consts import X_App_Name, chat_strategy, ChatStrategy
from utils.sqlalchemy_objs_to_json_array import sqlalchemy_objs_to_json_array
from .. import root_service
from flask_socketio import emit
import asyncio

logger = CustomLogger(module_name=__name__)

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

    response_data = {"chats": chats_filtered, "total_pages": total_pages}

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

    return {"data": chat_history_sessions, "total_pages": total_pages}


@chat_workflow.route("/init", methods=["GET"])
def init_chat():
    bot_token = request.headers.get("X-Bot-Token")
    session_id = request.headers.get("X-Session-Id")

    history = []
    if session_id:
        chats, _ = get_all_chat_history_by_session_id_with_total(session_id, 200, 0)
        history = sqlalchemy_objs_to_json_array(chats) or []

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
        return jsonify(
            {
                "bot_name": bot.name,
                "logo": "logo",
                "faq": [],  # Replace with actual FAQ data
                "inital_questions": [],
                "history": history,
            }
        )
    except Exception as e:
        return Response(status=HTTPStatus.NOT_FOUND, response="Bot Not Found")


async def send_chat_stream(
    message: str, bot_token: str, session_id: str, headers_from_json: Dict[str, str]
):
    await handle_chat_send_common(
        message, bot_token, session_id, headers_from_json, is_streaming=True
    )


@chat_workflow.route("/send", methods=["POST"])
async def send_chat():
    json_data = request.get_json()

    input_data = ChatInput(**json_data)
    message = input_data.content
    session_id = input_data.session_id
    headers_from_json = input_data.headers or {}

    bot_token = request.headers.get("X-Bot-Token")
    return await handle_chat_send_common(
        message, bot_token, session_id, headers_from_json, is_streaming=False
    )


async def handle_chat_send_common(
    message: str,
    bot_token: Optional[str],
    session_id: str,
    headers_from_json: Dict[str, str],
    is_streaming: bool,
):
    app_name = headers_from_json.pop(X_App_Name, None)
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
            str(bot.id),
            headers_from_json,
            app_name,
            is_streaming,
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
                    "debug_json": result.api_request_response.api_requests,
                },
            ]

            upsert_analytics_record(
                chatbot_id=str(bot.id), successful_operations=1, total_operations=1
            )
            create_chat_histories(str(bot.id), chat_records)

        if result.error:
            logger.error("chat_conversation_error", message=result.error)

        # elif result.error:
        #     upsert_analytics_record(
        #         chatbot_id=str(bot.id),
        #         successful_operations=0,
        #         total_operations=1,
        #         logs=result.error,
        #     )
        emit(session_id, "|im_end|") if is_streaming else jsonify(
            {"type": "text", "response": {"text": result.message}}
        )
    except Exception as e:
        logger.error(
            "An exception occurred",
            incident="chat/send",
            error=str(e),
            bot_token=bot_token,
        )
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
