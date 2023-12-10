from flask import Blueprint, jsonify, request, abort
from pydantic import BaseModel
from werkzeug.utils import secure_filename
from typing import Any
from entities.action_entity import ActionDTO
from models.repository.action_repo import (
    list_all_actions,
    action_to_dict,
    create_action,
    find_action_by_id,
    update_action,
)
from routes.action import action_vector_service
from utils.swagger_parser import SwaggerParser

action = Blueprint("action", __name__)


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
            actions = swagger_parser.get_all_actions()
        except Exception as e:
            return jsonify({"error": f"Failed to parse Swagger file: {str(e)}"}), 400

        # Store actions in the database
        for action_data in actions:
            try:
                create_action(chatbot_id, action_data)
                # todo sync with the vector db
            except Exception as e:
                return jsonify({"error": f"Failed to store action: {str(e)}"}), 500

        return (
            jsonify({"message": f"Successfully imported actions from {filename}"}),
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


@action.route("/<string:action_id>", methods=["PUT"])
def update_action_api(action_id):
    # Find the existing action
    existing_action = find_action_by_id(action_id)
    if existing_action is None:
        return jsonify({"error": "Action not found"}), 404

    # Ensure request JSON is available
    if not request.json:
        abort(400, description="No JSON data provided")

    # Extract data from the request
    request_data = request.get_json()

    # Extract individual fields from request_data, using existing values as defaults
    name = request_data.get("name", existing_action.name)
    description = request_data.get("description", existing_action.description)
    base_uri = request_data.get("base_uri", existing_action.base_uri)
    request_type = request_data.get("request_type", existing_action.request_type)
    operation_id = request_data.get("operation_id", existing_action.operation_id)
    payload = request_data.get("payload", existing_action.payload)

    try:
        # Update ActionDTO explicitly with each field
        updated_action_dto = ActionDTO(
            name=name,
            description=description,
            base_uri=base_uri,
            request_type=request_type,
            operation_id=operation_id,
            payload=payload,
        )
    except Exception as e:
        # Handle validation errors
        return jsonify({"error": str(e)}), 400

    # Update the action using the repository
    updated_action = update_action(action_id, updated_action_dto)

    # Todo: sync with vector db if necessary

    # Convert the updated action DTO to a dictionary for JSON response
    return jsonify(action_to_dict(updated_action)), 200


@action.route("/<string:action_id>", methods=["GET"])
def get_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({"error": "Action not found"}), 404
    return jsonify(action_to_dict(action))
