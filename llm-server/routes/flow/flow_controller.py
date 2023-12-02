from flask import Blueprint, Response, jsonify, request

from models.repository.copilot_repo import find_one_or_fail_by_id
from models.repository.flow_repo import create_flow, get_all_flows_for_bot, get_flow_by_id, get_variables_for_flow, \
    add_or_update_variable_in_flow, add_action_to_flow_block, remove_action_from_flow_block
from presenters.flow_presenters import flow_to_dict, flow_to_dict_with_nested_entities, flow_variable_to_dict, \
    block_action_to_dict
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
        data = request.form
        if not data:
            return jsonify({"error": "No data provided"}), 400

        name = data.get("name")
        if not name:
            return jsonify({"error": "Missing required field: 'name'"}), 400

        # Additional validations can be added here if needed
        # For example, checking the length of the name, or if it contains invalid characters, etc.

        flow = create_flow(bot_id, name)
        return jsonify(flow_to_dict(flow)), 201
    except Exception as e:
        # Log the exception here
        print(f"Error creating flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to create flow. {}".format(str(e))}), 500


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
            return jsonify(flow_to_dict_with_nested_entities(flow)), 200
        else:
            return jsonify({"error": "Flow not found"}), 404
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flow with ID {flow_id}: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow"}), 500


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
        return jsonify({"status": "success", "data": variables_dict}), 200
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flow variables for flow ID {flow_id}: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow variables"}), 500


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
        copilot_id = data.get('copilot_id')
        bot = find_one_or_fail_by_id(copilot_id)

        if not name or value is None:
            return jsonify({"error": "Missing required fields"}), 400

        variable = add_or_update_variable_in_flow(bot.id.flow_id, name, value, runtime_override_key,
                                                  runtime_override_action_id)
        return jsonify({"status": "success", "data": flow_variable_to_dict(variable)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error adding/updating variable in flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to add/update variable in flow"}), 500


@flow.route("/<flow_id>/actions", methods=["POST"])
def add_action_to_flow_api(flow_id: str):
    """
    API endpoint to add a new action to a specific flow.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with the newly created BlockAction object as a dictionary.
    """
    try:
        # Extracting action data from the request
        data = request.json
        flow_block_id = data.get('flow_block_id')
        name = data.get('name')
        action_type = data.get('type', 'api')  # Default to 'api' if not provided
        swagger_endpoint = data.get('swagger_endpoint', None)
        order = data.get('order', 0)  # Default to 0 if not provided

        # Basic validation
        if not all([flow_block_id, name]):
            return jsonify({"error": "Missing required fields, make sure [flow_block_id, name] are exist"}), 400

        action = add_action_to_flow_block(flow_id, flow_block_id, name, action_type, swagger_endpoint, order)
        return jsonify({"status": "success", "data": block_action_to_dict(action)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error adding action to flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to add action to flow"}), 500


@flow.route("/<flow_id>/actions", methods=["DELETE"])
def remove_action_from_flow_api(flow_id: str):
    """
    API endpoint to remove an action from a specific flow.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object indicating the result of the operation.
    """
    try:
        # Extracting action ID from the request
        data = request.json
        action_id = data.get('action_id')

        if not action_id:
            return jsonify({"error": "Missing required field: action_id"}), 400

        success = remove_action_from_flow_block(flow_id, action_id)
        if success:
            return jsonify({"status": "success", "message": "Action removed successfully"}), 200
        else:
            return jsonify({"error": "Action not found or could not be removed"}), 404
    except Exception as e:
        # Log the exception here
        print(f"Error removing action from flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to remove action from flow"}), 500


@flow.route("/<flow_id>/actions", methods=["PATCH"])
def update_action_in_flow(session_id: str) -> Response:
    pass
