from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename

from entities.action_entity import ActionDTO
from models.repository.action_repo import (
    list_all_actions,
    action_to_dict,
    create_actions,
    create_action,
    find_action_by_id,
    update_action,
    delete_action_by_id,
)
from routes.action import action_vector_service
from utils.get_logger import CustomLogger
from utils.swagger_parser import SwaggerParser

action = Blueprint("action", __name__)

logger = CustomLogger("action")


@action.route("/bot/<string:chatbot_id>", methods=["GET"])
def get_actions(chatbot_id):
    actions = list_all_actions(chatbot_id)
    return jsonify([action_to_dict(action) for action in actions])


@action.route("/bot/<string:chatbot_id>/import-from-swagger", methods=["PUT"])
def import_actions_from_swagger_file(chatbot_id):
    # Check if the request has the file part
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    # If the user does not select a file, the browser submits an
    # empty file without a filename.
    if file.filename == "":
        return jsonify({"error": "No file part in the request"}), 400

    if file:
        filename = secure_filename(file.filename)
        swagger_content = file.read()

        # Parse Swagger file
        try:
            swagger_parser = SwaggerParser(swagger_content)
            swagger_parser.ingest_swagger_summary(chatbot_id)
            actions = swagger_parser.get_all_actions(chatbot_id)
        except Exception as e:
            logger.error("Failed to parse Swagger file", error=e, bot_id=chatbot_id)
            return (
                jsonify(
                    {
                        "message": f"Failed to parse Swagger file: {str(e)}",
                        "is_error": True,
                    }
                ),
                400,
            )

        is_error = False
        # Store actions in the database
        try:
            create_actions(chatbot_id, actions)
            action_vector_service.create_actions(actions)
        except Exception as e:
            logger.error(
                str(e),
                message="Something failed while parsing swagger file",
                bot_id=chatbot_id,
            )

        return (
            jsonify(
                {
                    "message": f"Successfully imported actions from {filename}",
                    "is_error": is_error,
                }
            ),
            201,
        )

    return jsonify({"error": "Invalid swagger file"}), 400


@action.route("/bot/<string:chatbot_id>", methods=["POST"])
def add_action(chatbot_id):
    action_dto = ActionDTO(bot_id=chatbot_id, **request.get_json())

    # Todo make sure either both or non go in
    saved_action = create_action(chatbot_id, action_dto)
    action_vector_service.create_action(action_dto)

    return jsonify(action_to_dict(saved_action)), 201


@action.route("/bot/<string:chatbot_id>/action/<string:action_id>", methods=["PATCH"])
def update_single_action(chatbot_id: str, action_id: str):
    action_dto = ActionDTO(bot_id=chatbot_id, **request.get_json())
    # Todo make sure either both or non go in
    saved_action = update_action(action_id, action_dto)
    action_vector_service.update_action_by_operation_id(action_dto)

    return jsonify(saved_action), 201


@action.route("/<string:action_id>", methods=["GET"])
def get_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({"error": "Action not found"}), 404
    return jsonify(action_to_dict(action))


@action.route("/<string:action_id>", methods=["DELETE"])
def delete_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({"error": "Action not found"}), 404

    action_vector_service.delete_action_by_operation_id(
        bot_id=str(action.bot_id), operation_id=str(action.operation_id)
    )
    delete_action_by_id(
        operation_id=str(action.operation_id), bot_id=str(action.bot_id)
    )
    return jsonify({"message": "Action deleted successfully"}), 200
