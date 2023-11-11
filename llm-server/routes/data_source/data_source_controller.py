from models.repository.datasource_repo import get_all_datasource_by_bot_id
from flask import Blueprint, request, jsonify
from utils.db import Database
from flask import Flask, request, jsonify, Blueprint, request, Response
from operator import itemgetter

db_instance = Database()
mongo = db_instance.get_db()

datasource_workflow = Blueprint("datasource", __name__)


@datasource_workflow.route("/b/<bot_id>", methods=["GET"])
def get_data_sources(bot_id: str) -> Response:
    limit = request.args.get("limit", 20)
    offset = request.args.get("offset", 0)

    datasources = get_all_datasource_by_bot_id(bot_id, limit, offset)

    chats_filtered = []

    for ds in datasources:
        chats_filtered.append(
            {
                "id": ds.id,
                "chatbot_id": ds.created_at,
                "files": ds.file_name,
                "status": ds.status,
                "updated_at": ds.updated_at,
            }
        )

    return jsonify(chats_filtered)
