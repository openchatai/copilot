from flask import Blueprint, request, jsonify
from models.repository.api_call_repository import APICallRepository
from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.database_setup import engine
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)

api_call_controller = Blueprint("api_call_controller", __name__)
SessionLocal = sessionmaker(bind=engine)


@api_call_controller.route("/log", methods=["POST"])
def log_api_call():
    data = request.get_json()
    url = data.get("url")
    path = data.get("path")
    query_params = data.get("query_params")
    path_params = data.get("path_params")
    method = data.get("method")

    if not all([url, path, query_params, path_params, method]):
        return jsonify({"error": "Missing required parameters"}), 400

    db_session = SessionLocal()
    repository = APICallRepository(db_session)
    repository.log_api_call(url, path, method, path_params, query_params)
    db_session.close()

    return jsonify({"message": "API call logged successfully"}), 200
