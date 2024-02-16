import os
from http import HTTPStatus

from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from enums.initial_prompt import ChatBotInitialPromptEnum
from models.repository.copilot_repo import (
    delete_copilot_global_key,
    list_all_with_filter,
    find_or_fail_by_bot_id,
    find_one_or_fail_by_id,
    create_copilot,
    chatbot_to_dict,
    SessionLocal,
    update_copilot,
    store_copilot_global_variables,
)
from models.repository.powerup_repo import create_powerups_bulk
from routes._swagger.reindex_service import migrate_actions
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)
copilot = Blueprint("copilot", __name__)

UPLOAD_FOLDER = "shared_data"


@copilot.route("/", methods=["GET"])
def index():
    chatbots = list_all_with_filter()
    return jsonify([chatbot_to_dict(chatbot) for chatbot in chatbots])


@copilot.route("/", methods=["POST"])
def create_new_copilot():
    chatbot = create_copilot(
        name=request.form.get("name", "My First Copilot"),
        swagger_url="remove.this.filed.after.migration",
        prompt_message=request.form.get(
            "prompt_message", ChatBotInitialPromptEnum.AI_COPILOT_INITIAL_PROMPT
        ),
        website=request.form.get("website", "https://example.com"),
    )

    # Define the system prompts for the three powerups
    powerup_apps = [
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI assistant that excels at correcting grammar mistakes. Please improve the following text while maintaining the original meaning:",
            "name": "Text Corrector",
            "description": "Corrects grammar mistakes in a given text while maintaining the original meaning.",
        },
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI that predicts the next word in a sequence of text. Given the text below, predict the most likely next word:",
            "name": "Next Word Predictor",
            "description": "Predicts the next word in a sequence of text.",
        },
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI that rephrases sentences to enhance clarity and style. Please rephrase the following sentence:",
            "name": "Sentence Rephraser",
            "description": "Rephrases sentences to enhance clarity and style.",
        },
    ]

    create_powerups_bulk(powerup_apps)
    return jsonify(chatbot)


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

        # This should be soft delete but for now, we are doing hard delete
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

        logger.info(
            "Updating Copilot",
            incident="update_copilot",
            data=data,
            bot_id=copilot_id,
        )
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


@copilot.route("/<string:copilot_id>/variables", methods=["POST", "PATCH", "PUT"])
def update_global_variables(copilot_id):
    try:
        # Ensure the chatbot exists
        find_one_or_fail_by_id(copilot_id)

        # Retrieve JSON data from the request
        data = request.json

        # Validate that data is a dictionary
        if not isinstance(data, dict):
            return (
                jsonify({"error": "Invalid data format, expected a JSON object"}),
                400,
            )

        store_copilot_global_variables(copilot_id=copilot_id, new_variables=data)

        # Return a success response
        return jsonify({"message": "JSON data stored successfully"})
    except ValueError as e:
        # Handle not found error
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        # Handle other exceptions
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@copilot.route(
    "/<string:copilot_id>/variable/<string:variable_key>", methods=["DELETE"]
)
def delete_global_variable(copilot_id: str, variable_key: str):
    return delete_copilot_global_key(copilot_id=copilot_id, variable_key=variable_key)


@copilot.route("/<string:copilot_id>/variables", methods=["GET"])
def get_global_variables(copilot_id):
    try:
        # Ensure the chatbot exists
        chatbot = find_one_or_fail_by_id(copilot_id)

        return jsonify(chatbot.global_variables), 200
    except ValueError as e:
        # Handle not found error
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        # Handle other exceptions
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


@copilot.route("/migrate/actions", methods=["POST"])
def migrate():
    auth_header = request.headers.get("Authorization")
    if auth_header:
        token = auth_header.split(" ")[1]

        if token == os.getenv("BASIC_AUTH_KEY"):
            migrate_actions()
            return jsonify({"message": "job started"}), HTTPStatus.OK

    return (
        jsonify({"message": "Authorization Failed!"}),
        HTTPStatus.NETWORK_AUTHENTICATION_REQUIRED,
    )
