from flask import Blueprint, Response, jsonify, request

from models.repository.flow_repo import create_flow
from presenters.flow_presenters import flow_to_dict
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

flow = Blueprint("flow", __name__)


@flow.route("/bot/<bot_id>/flows", methods=["GET"])
def get_all_flows_by_bot_id(bot_id: str) -> Response:
    return jsonify([
        {
            'id': 'uuid4',
            'name': 'Add to cart flow',
        },
        {
            'id': 'uuid4',
            'name': 'Add to cart flow',
        },
        {
            'id': 'uuid4',
            'name': 'Add to cart flow',
        },
        {
            'id': 'uuid4',
            'name': 'Add to cart flow',
        }
    ])


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
        return jsonify({"status": "success", "data": flow_to_dict(flow)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error creating flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to create flow"}), 500


@flow.route("/<flow_id>", methods=["GET"])
def get_flow_by_id(flow_id: str) -> Response:
    return jsonify({
        'id': 'uuid4',
        'name': 'Add to cart flow',
        'blocks': [
            {
                'id': 'action_id',
                'order': 1,
                'type': 'block',
                'next_on_success': 'some_action_id',
                'next_on_fail': 'some_action_id',
                'name': 'Create stuff',
                'apis': [
                    {
                        # ... Swagger endpoint
                        'parameters': {
                            'x': '{env_x}',
                            'y': 'magic_y'
                        }
                    },

                ]

            },
            # ...
        ]
    })


@flow.route("/<flow_id>/variables", methods=["GET"])
def get_flow_variables(flow_id: str) -> Response:
    return jsonify({
        'flow_id': "uuid4",
        'name': 'Flow name',
        'variables': [
            {
                'name': '{xxx}',
                'dynamic_value_from': 'action_id.json.key',
                'static_value': '',
                'is_magic_fill': False
            }
        ]
    })


@flow.route("/<flow_id>/variables", methods=["POST", "PUT"])
def add_variables_to_flow(flow_id: str) -> Response:
    pass


@flow.route("/<flow_id>/actions", methods=["POST"])
def add_action_to_flow(flow_id: str) -> Response:
    pass


@flow.route("/<flow_id>/actions", methods=["DELETE"])
def remove_action_from_flow(flow_id: str) -> Response:
    pass


@flow.route("/<flow_id>/actions", methods=["PATCH"])
def update_action_in_flow(session_id: str) -> Response:
    pass
