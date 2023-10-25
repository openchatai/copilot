from models.repository.chat_history_repo import get_all_chat_history_by_session_id
from flask import Blueprint, request, jsonify
from utils.db import Database


db_instance = Database()
mongo = db_instance.get_db()

chat_workflow = Blueprint("chat", __name__)


@chat_workflow.route("/sessions/<session_id>/chats")
def get_session_chats(session_id: str):

  limit = request.args.get("limit", 20)
  offset = request.args.get("offset", 0)
  
  chats = get_all_chat_history_by_session_id(session_id, limit, offset)

  return jsonify(chats)
