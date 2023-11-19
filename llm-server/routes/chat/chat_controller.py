from models.repository.chat_history_repo import (
    get_all_chat_history_by_session_id,
    get_unique_sessions_with_first_message_by_bot_id,
)
from flask import Blueprint, request, jsonify
from opencopilot_db import Chatbot
from utils.db import Database
from flask import Flask, request, jsonify, Blueprint, request, Response
from operator import itemgetter

db_instance = Database()
mongo = db_instance.get_db()

chat_workflow = Blueprint("chat", __name__)


@chat_workflow.route("/sessions/<session_id>/chats", methods=["GET"])
def get_session_chats(session_id: str) -> Response:
    limit = request.args.get("limit", 20)
    offset = request.args.get("offset", 0)

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


# unique_session_ids = get_unique_session_ids(session)


@chat_workflow.route("/b/<bot_id>/chat_sessions", methods=["GET"])
def get_chat_sessions(bot_id: str) -> Response:
    limit = request.args.get("limit", 20)
    offset = request.args.get("offset", 0)
    chat_history_sessions = get_unique_sessions_with_first_message_by_bot_id(
        bot_id, limit, offset
    )

    return chat_history_sessions


@chat_workflow.route('/chat/init', methods=['GET'])
def init_chat():
    bot_token = request.headers.get('X-Bot-Token')

    bot = Chatbot.query.filter_by(token=bot_token).first()

    if not bot:
        return jsonify({
            "type": "text",
            "response": {
                "text": f"Could not find bot with token {bot_token}"
            }
        }), 404

    # Assuming getName() is a method in your Chatbot model.
    # If it's just an attribute, use `bot.name`.
    # Also, replace 'faq' and 'initialQuestions' with actual logic or data as needed.
    return jsonify({
        "bot_name": bot.getName(),
        "logo": "logo",
        "faq": [],  # Replace with actual FAQ data
        "initial_questions": [],  # Replace with actual initial questions
    })
