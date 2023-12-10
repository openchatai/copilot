from flask import Blueprint, jsonify, request

from entities.flow_entity import FlowDTO
from models.repository.copilot_repo import find_one_or_fail_by_id
from models.repository.flow_repo import create_flow, get_all_flows_for_bot, get_flow_by_id, get_variables_for_flow, \
    add_or_update_variable_in_flow, update_flow
from presenters.flow_presenters import flow_to_dict, flow_variable_to_dict
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

flow = Blueprint("flow", __name__)


@flow.route("/bot/<bot_id>", methods=["GET"])
def get_all_flows_api(bot_id: str):
    """
    API endpoint to retrieve all flows for a given bot.

    Args:
        bot_id: The ID of the bot.

    Returns:
        A Flask response object with a list of Flow objects as dictionaries.
    """
    try:
        flows = get_all_flows_for_bot(bot_id)
        flows_dict = [flow_to_dict(flow) for flow in
                      flows]  # Assuming flow_to_dict is a function to convert Flow objects to dictionaries
        return jsonify(flows_dict), 200
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flows for bot ID {bot_id}: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flows"}), 500


@flow.route("/bot/<bot_id>", methods=["POST"])
def create_flow_api(bot_id: str):
    """
    API endpoint to create a new flow record.

    Args:
        bot_id: The ID of the chatbot associated with the flow.

    Returns:
        A Flask response object with the newly created Flow object as a dictionary.
    """
    try:
        # Extract and validate incoming data
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Extract individual fields from data
        name = data.get('name')
        status = data.get('status')
        variables = data.get('variables', [])
        blocks = data.get('blocks', [])

        # Validate data using FlowDTO
        try:
            flow_dto = FlowDTO(
                chatbot_id=bot_id,
                name=name,
                status=status,
                variables=variables,
                blocks=blocks,
                created_at=data.get('created_at'),  # Assuming this is provided, or use datetime.datetime.utcnow()
                updated_at=data.get('updated_at'),  # Similarly, either provided or use datetime.datetime.utcnow()
                id=data.get('id')  # Assuming this is provided, or use uuid.uuid4()
            )
        except Exception as e:
            return jsonify({"error": str(e)}), 400

        # Assuming create_flow is a function to save the flow to DB
        flow = create_flow(flow_dto)
        return jsonify(flow_to_dict(flow)), 201

    except Exception as e:
        print(f"Error creating flow: {e}")
        return jsonify({"error": "Failed to create flow. {}".format(str(e))}), 500



@flow.route("/<flow_id>", methods=["PUT"])
def update_flow_api(flow_id: str):
    """
    API endpoint to update an existing flow record.

    Args:
        flow_id: The ID of the flow to be updated.

    Returns:
        A Flask response object with the updated Flow object as a dictionary.
    """
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name")
        description = data.get("description", None)
        payload = data.get("blocks", {})  # TODO: Add validation

        if not name:
            return jsonify({"error": "Missing required field: 'name'"}), 400

        updated_flow = update_flow(flow_id, name, payload, description)
        if updated_flow:
            return jsonify(flow_to_dict(updated_flow)), 200
        else:
            return jsonify({"error": "Flow not found"}), 404
    except Exception as e:
        print(f"Error updating flow: {e}")
        return jsonify({"error": "Failed to update flow. {}".format(str(e))}), 500


@flow.route("/<flow_id>", methods=["GET"])
def get_flow_by_id_api(flow_id: str):
    """
    API endpoint to retrieve a specific flow by its ID.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with the Flow object as a dictionary.
    """
    try:
        flow = get_flow_by_id(flow_id)
        if flow:
            return jsonify(flow_to_dict(flow)), 200
        else:
            return jsonify({"error": "Flow not found"}), 404
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flow with ID {flow_id}: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow {}".format(str(e))}), 500


@flow.route("/<flow_id>/variables", methods=["GET"])
def get_flow_variables_api(flow_id: str):
    """
    API endpoint to retrieve variables associated with a specific flow.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with a list of FlowVariable objects as dictionaries.
    """
    try:
        flow_variables = get_variables_for_flow(flow_id)
        variables_dict = [flow_variable_to_dict(variable) for variable in
                          flow_variables]  # Assuming flow_variable_to_dict is defined
        return jsonify(variables_dict), 200
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flow variables for flow ID {flow_id}: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow variables {}".format(str(e))}), 500


@flow.route("/<flow_id>/variables", methods=["POST", "PUT"])
def add_variables_to_flow_api(flow_id: str):
    """
    API endpoint to add or update variables in a specific flow.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with the updated or newly created FlowVariable object as a dictionary.
    """
    try:
        data = request.json
        name = data.get('name')
        value = data.get('value')
        runtime_override_key = data.get('runtime_override_key', None)
        runtime_override_action_id = data.get('runtime_override_action_id', None)
        copilot_id = data.get('chatbot_id')
        bot = find_one_or_fail_by_id(copilot_id)

        if not name or value is None:
            return jsonify({"error": "Missing required fields"}), 400

        variable = add_or_update_variable_in_flow(bot.id, flow_id, name, value, runtime_override_key,
                                                  runtime_override_action_id)
        return jsonify({"status": "success", "data": flow_variable_to_dict(variable)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error adding/updating variable in flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to add/update variable in flow {}".format(str(e))}), 500
