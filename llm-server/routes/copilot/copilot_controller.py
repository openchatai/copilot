import json
import os
import uuid

from flask import Blueprint, jsonify, request
from prance import ValidationError
from sqlalchemy.exc import SQLAlchemyError
from routes.root_service import get_swagger_doc
from utils.llm_consts import EXPERIMENTAL_FEATURES_ENABLED, get_username_from_request
from werkzeug.utils import secure_filename
from utils.base import resolve_abs_local_file_path_from
from utils.get_logger import struct_log
from opencopilot_db.chatbot import Chatbot

import routes._swagger.service as swagger_service
from enums.initial_prompt import ChatBotInitialPromptEnum
from models.repository.copilot_repo import (
    list_all_with_filter,
    find_or_fail_by_bot_id,
    find_one_or_fail_by_id,
    create_copilot,
    chatbot_to_dict,
    SessionLocal,
    update_copilot,
)
from utils.swagger_parser import SwaggerParser

copilot = Blueprint("copilot", __name__)

UPLOAD_FOLDER = "shared_data"


@copilot.route("/", methods=["GET"])
def index():
    email = get_username_from_request(request)
    filter_criteria = Chatbot.email == email
    chatbots = list_all_with_filter(filter_criteria=filter_criteria)

    return jsonify([chatbot_to_dict(chatbot) for chatbot in chatbots])


@copilot.route("/swagger", methods=["POST"])
def handle_swagger_file():
    if "swagger_file" not in request.files:
        return jsonify({"error": "You must upload a swagger file."}), 400
    struct_log.info(event="handling swagger file", data=request.get_data)
    file = request.files["swagger_file"]
    if file.filename == "":
        return jsonify({"error": "No selected file."}), 400
    if file:
        try:
            filename = secure_filename(str(uuid.uuid4()) + ".json")
            file.save(os.path.join(UPLOAD_FOLDER, filename))

            chatbot = create_copilot(
                name=request.form.get("name", "My First Copilot"),
                swagger_url=filename,
                prompt_message=request.form.get(
                    "prompt_message", ChatBotInitialPromptEnum.AI_COPILOT_INITIAL_PROMPT
                ),
                website=request.form.get("website", "https://example.com"),
                email=get_username_from_request(request),
            )

            swagger_doc = get_swagger_doc(filename)

            if EXPERIMENTAL_FEATURES_ENABLED == "YES":
                swagger_service.save_swagger_paths_to_qdrant(swagger_doc, chatbot["id"])

            swagger_service.save_swaggerfile_to_mongo(
                filename, str(chatbot["id"]), swagger_doc
            )
        except ValidationError as e:
            return (
                jsonify(
                    {
                        "failure": "The copilot was created, but we failed to handle the swagger file duo to some"
                        " validation issues, your copilot will work fine but without the ability to"
                        " talk with any APIs. error: {}".format(str(e))
                    }
                ),
                400,
            )

        return jsonify({"file_name": filename, "chatbot": chatbot})

    return jsonify({"failure": "could_not_handle_swagger_file"}), 400


@copilot.route("/<string:copilot_id>", methods=["GET"])
def get_copilot(copilot_id):
    try:
        bot = find_one_or_fail_by_id(copilot_id)
    except ValueError:
        # If the bot is not found, a ValueError is raised
        return jsonify({"failure": "chatbot_not_found"}), 404
    except SQLAlchemyError as e:
        # Handle any SQLAlchemy errors
        return jsonify({"error": "Database error", "details": str(e)}), 500

    return jsonify({"chatbot": chatbot_to_dict(bot)})


@copilot.route("/<string:copilot_id>", methods=["DELETE"])
def delete_bot(copilot_id):
    session = SessionLocal()
    try:
        # Find the bot
        bot = find_or_fail_by_bot_id(copilot_id)

        # Delete the bot using the session
        session.delete(bot)
        session.commit()
        return jsonify({"success": "chatbot_deleted"}), 200
    except ValueError:
        # If the bot is not found, a ValueError is raised
        return jsonify({"failure": "chatbot_not_found"}), 404
    except SQLAlchemyError as e:
        # Handle any SQLAlchemy errors
        session.rollback()
        return jsonify({"error": "Database error", "details": str(e)}), 500
    finally:
        session.close()


@copilot.route("/<string:copilot_id>", methods=["POST", "PATCH", "PUT"])
def general_settings_update(copilot_id):
    try:
        # Ensure the chatbot exists
        find_one_or_fail_by_id(copilot_id)

        data = request.json

        struct_log.info(event="update_copilot", data=data, bot_id=copilot_id)

        # Call update_copilot with the provided data
        updated_copilot = update_copilot(
            copilot_id=copilot_id,
            name=data.get("name"),
            prompt_message=data.get("prompt_message"),
            swagger_url=data.get("swagger_url"),
            enhanced_privacy=data.get("enhanced_privacy"),
            smart_sync=data.get("smart_sync"),
            website=data.get("website"),
        )

        # Return the updated chatbot information
        return jsonify({"chatbot": updated_copilot})
    except ValueError as e:
        # Handle not found error
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        # Handle other exceptions
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@copilot.route("/<string:copilot_id>/validator", methods=["GET"])
def validator(copilot_id):
    bot = find_one_or_fail_by_id(copilot_id)

    try:
        swagger_url = bot.swagger_url  # Adjust attribute name as necessary
        swagger_content = ""

        if not swagger_url.startswith("https"):
            swagger_url = resolve_abs_local_file_path_from(swagger_url)
            # Read the file content from the local system or shared storage
            with open(swagger_url, "r") as file:
                swagger_content = file.read()

        swagger_data = json.loads(swagger_content)
        parser = SwaggerParser(swagger_data)

    except Exception as e:
        return (
            jsonify(
                {
                    "error": "Failed to load the swagger file for validation. error: "
                    + str(e)
                }
            ),
            400,
        )

    endpoints = parser.get_endpoints()
    validations = parser.get_validations()
    return jsonify(
        {
            "chatbot_id": bot.id,
            "all_endpoints": [endpoint.to_dict() for endpoint in endpoints],
            "validations": validations,
        }
    )
