from flask import Blueprint, Response, jsonify, request

from models.repository.flow_repo import create_flow, get_all_flows_for_bot, get_flow_by_id, get_variables_for_flow, \
    add_or_update_variable_in_flow
from presenters.flow_presenters import flow_to_dict, flow_to_dict_with_nested_entities, flow_variable_to_dict
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

flow = Blueprint("flow", __name__)


@flow.route("/bot/<bot_id>/flows", methods=["GET"])
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


@flow.route("/bot/<bot_id>/flows", methods=["POST"])
def create_flow_api(bot_id: str):
    """
    API endpoint to create a new flow record.

    Args:
        bot_id: The ID of the chatbot associated with the flow.

    Returns:
        A Flask response object with the newly created Flow object as a dictionary.
    """
    try:
        name = request.json.get("name")
        flow = create_flow(bot_id, name)
        return jsonify(flow_to_dict(flow)), 201
    except Exception as e:
        # Log the exception here
        print(f"Error creating flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to create flow"}), 500


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
        # Extracting variable data from the request
        data = request.json
        name = data.get('name')
        value = data.get('value')

        if not name or value is None:
            return jsonify({"error": "Missing required fields"}), 400

        variable = add_or_update_variable_in_flow(flow_id, name, value)
        return jsonify({"status": "success", "data": flow_variable_to_dict(variable)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error adding/updating variable in flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to add/update variable in flow"}), 500


@flow.route("/<flow_id>/actions", methods=["POST"])
def add_action_to_flow(flow_id: str) -> Response:
    pass


@flow.route("/<flow_id>/actions", methods=["DELETE"])
def remove_action_from_flow(flow_id: str) -> Response:
    pass


@flow.route("/<flow_id>/actions", methods=["PATCH"])
def update_action_in_flow(session_id: str) -> Response:
    pass
