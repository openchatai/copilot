from flask import Blueprint, Response, jsonify

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


