from flask import Blueprint, jsonify, request
from shared.models.opencopilot_db.powerups import PowerUp
from models.repository.powerup_repo import (
    create_powerup,
    get_all_powerups,
    get_regex_for_dynamic_params,
    update_powerup,
    delete_powerup,
)
from utils.get_chat_model import get_chat_model
from langchain.schema import HumanMessage, SystemMessage

powerup = Blueprint("powerup", __name__)


@powerup.route("/", methods=["POST"])
def create_powerup_endpoint():
    powerup_data = request.json
    if not powerup_data:
        return jsonify({"error": "PowerUp data is required"}), 400
    if powerup_data.get("path", None) is not None:
        powerup_data["path"] = get_regex_for_dynamic_params(powerup_data.get("path"))
    powerup = create_powerup(powerup_data)
    return jsonify(powerup), 201


@powerup.route("/", methods=["GET"])
def get_all_powerups_endpoint():
    path = request.args.get("path", None)

    if path is not None:
        path = get_regex_for_dynamic_params(path)

    powerups = get_all_powerups(path)
    return jsonify(powerups), 200


@powerup.route("/<int:powerup_id>", methods=["PUT"])
def update_powerup_endpoint(powerup_id):
    powerup_data = request.json
    if not powerup_data:
        return jsonify({"error": "PowerUp data is required"}), 400
    powerup = update_powerup(powerup_id, powerup_data)
    if powerup:
        return jsonify(powerup), 200
    else:
        return jsonify({"error": "PowerUp not found"}), 404


@powerup.route("/<int:powerup_id>", methods=["DELETE"])
def delete_powerup_endpoint(powerup_id):
    success = delete_powerup(powerup_id)
    if success:
        return jsonify({"message": "PowerUp deleted successfully"}), 200
    else:
        return jsonify({"error": "PowerUp not found"}), 404


@powerup.route("/<int:powerup_id>", methods=["POST"])
def powerup_typing(powerup_id):
    user_input = request.json.get("user_input")
    if not user_input:
        return jsonify({"error": "User input is required"}), 400

    # Retrieve the PowerUp instance by ID
    powerup = PowerUp.query.get(powerup_id)
    if not powerup:
        return jsonify({"error": "PowerUp not found"}), 404

    # Make the LLM call using the base_prompt and user_input
    chat_model = get_chat_model()
    messages = [
        SystemMessage(content=powerup.base_prompt),
        HumanMessage(content=user_input),
    ]
    content = chat_model(messages).content

    # Return the LLM response
    return jsonify({"response": content}), 200


@powerup.route("/i/instruct", methods=["POST"])
def powerup_instruct():
    instruction = request.json.get("instruction")
    input_data = request.json.get("input_data")
    additional_context = request.json.get("context", None)

    if not instruction or not input_data:
        return jsonify({"error": "Instruction and input data are required"}), 400

    chat_model = get_chat_model()
    system_message = SystemMessage(
        content="You are an ai assistant that helps people with their writing."
    )
    instruction_message = HumanMessage(content=instruction)
    input_data_message = HumanMessage(content=input_data)
    messages = []
    messages.append(system_message)
    messages.append(instruction_message)
    if additional_context is not None:
        context_message = HumanMessage(
            content=f"<!-- Additional Context: {additional_context} -->"
        )
        messages.append(context_message)

    messages.append(input_data_message)

    content = chat_model(messages).content
    return jsonify({"response": content}), 200
