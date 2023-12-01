from typing import cast

from flask import jsonify, Blueprint, request, Response, abort, Request
from werkzeug.datastructures import Headers
from utils.llm_consts import SUMMARIZATION_PROMPT, SYSTEM_MESSAGE_PROMPT
from utils.sqlalchemy_objs_to_json_array import sqlalchemy_objs_to_json_array
from models.repository.chat_history_repo import (
    get_all_chat_history_by_session_id,
    get_unique_sessions_with_first_message_by_bot_id,
    create_chat_history,
)
from models.repository.copilot_repo import find_one_or_fail_by_token
from utils.db import Database
from .. import root_service
from utils import struct_log
from typing import Optional

db_instance = Database()
mongo = db_instance.get_db()

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


@chat_workflow.route("/b/<bot_id>", methods=["POST"])
def add_prompts(bot_id: str) -> Response:
    data = get_validated_data(request)

    if data is None:
        return Response(status=400)

    try:
        mongo.prompts.insert_one(
            {
                "bot_id": bot_id,
                "app": data["app"],
                "system_prompt": data[SYSTEM_MESSAGE_PROMPT],
                "summarization_prompt": data[SUMMARIZATION_PROMPT],
            }
        )
    except Exception as e:
        print(f"Error inserting prompt: {e}")
        return Response(status=500)

    return Response(status=200)


@chat_workflow.route("/sessions/<session_id>/chats", methods=["GET"])
def get_session_chats(session_id: str) -> Response:
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))

    chats = get_all_chat_history_by_session_id(session_id, limit, offset)

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
            }
        )

    return jsonify(chats_filtered)


@chat_workflow.route("/b/<bot_id>/chat_sessions", methods=["GET"])
def get_chat_sessions(bot_id: str) -> list[dict[str, object]]:
    limit = cast(int, request.args.get("limit", 20))
    offset = cast(int, request.args.get("offset", 0))
    chat_history_sessions = get_unique_sessions_with_first_message_by_bot_id(
        bot_id, limit, offset
    )

    return chat_history_sessions


@chat_workflow.route("/init", methods=["GET"])
def init_chat():
    bot_token = request.headers.get("X-Bot-Token")
    session_id = request.headers.get("X-Session-Id")

    history = []
    if session_id:
        chats = get_all_chat_history_by_session_id(session_id, 200, 0)
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

    bot = find_one_or_fail_by_token(bot_token)
    # Replace 'faq' and 'initialQuestions' with actual logic or data as needed.
    return jsonify(
        {
            "bot_name": bot.name,
            "logo": "logo",
            "faq": [],  # Replace with actual FAQ data
            "initial_questions": [],  # Replace with actual initial questions
            "history": history,
        }
    )


@chat_workflow.route("/send", methods=["POST"])
def send_chat():
    message = request.json.get("content")
    session_id = request.json.get("session_id")
    headers_from_json = request.json.get("headers", {})

    bot_token = request.headers.get("X-Bot-Token")

    if not message or len(message) > 255:
        abort(400, description="Invalid content, the size is larger than 255 char")

    if not bot_token:
        raise ValueError("bot token must be defined! ")
    bot = find_one_or_fail_by_token(bot_token)

    app_name = headers_from_json.get("X-App-Name") or None

    if app_name in headers_from_json:
        del headers_from_json["app_name"]

    swagger_url = bot.swagger_url

    base_prompt = bot.prompt_message
    server_base_url = request.form.get("server_base_url", "")

    if not bot:
        return (
            jsonify(
                {
                    "type": "text",
                    "response": {
                        "text": "I'm unable to help you at the moment, please try again later. **code: b404**"
                    },
                }
            ),
            404,
        )

    try:
        response_data = root_service.handle_request(
            text=message,
            swagger_url=swagger_url,
            session_id=session_id,
            base_prompt=base_prompt,
            bot_id=bot.id,
            headers=headers_from_json,
            server_base_url=server_base_url,
            app=app_name,
        )

        create_chat_history(bot.id, session_id, True, message)
        create_chat_history(
            bot.id,
            session_id,
            False,
            response_data["response"] or response_data["error"],
        )

        return jsonify(
            {"type": "text", "response": {"text": response_data["response"]}}
        )
    except Exception as e:
        struct_log.exception(event="/chat/send", error=str(e))
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
