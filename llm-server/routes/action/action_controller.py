from flask import Blueprint, jsonify, request, abort

from entities.action_entity import ActionDTO
from models.repository.action_repo import list_all_actions, action_to_dict, create_action, find_action_by_id, update_action

action = Blueprint('action', __name__)


@action.route('/bot/<string:chatbot_id>', methods=['GET'])
def get_actions(chatbot_id):
    actions = list_all_actions(chatbot_id)
    return jsonify([action_to_dict(action) for action in actions])


@action.route('/bot/<string:chatbot_id>', methods=['POST'])
def add_action(chatbot_id):
    # Ensure request JSON is available
    if not request.json:
        abort(400, description="No JSON data provided")

    # Extract data from the request
    request_data = request.get_json()

    # Extract individual fields from request_data
    name = request_data.get('name', '')
    description = request_data.get('description', '')
    base_uri = request_data.get('base_uri', '')
    request_type = request_data.get('request_type', '')
    operation_id = request_data.get('operation_id', '')
    payload = request_data.get('payload', {})

    try:
        # Create ActionDTO explicitly with each field
        action_dto = ActionDTO(
            name=name,
            description=description,
            base_uri=base_uri,
            request_type=request_type,
            operation_id=operation_id,
            payload=payload,
        )
    except Exception as e:
        # Handle validation errors
        return jsonify({"error": str(e)}), 201

    # Save the action using the repository
    saved_action = create_action(chatbot_id, action_dto)

    # Todo: sync with vector db

    # Convert the saved action DTO to a dictionary for JSON response

    return jsonify(action_to_dict(action)), 201


@action.route('/<string:action_id>', methods=['PUT'])
def update_action_api(action_id):
    # Find the existing action
    existing_action = find_action_by_id(action_id)
    if existing_action is None:
        return jsonify({'error': 'Action not found'}), 404

    # Ensure request JSON is available
    if not request.json:
        abort(400, description="No JSON data provided")

    # Extract data from the request
    request_data = request.get_json()

    # Extract individual fields from request_data, using existing values as defaults
    name = request_data.get('name', existing_action.name)
    description = request_data.get('description', existing_action.description)
    base_uri = request_data.get('base_uri', existing_action.base_uri)
    request_type = request_data.get('request_type', existing_action.request_type)
    operation_id = request_data.get('operation_id', existing_action.operation_id)
    payload = request_data.get('payload', existing_action.payload)

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


@action.route('/<string:action_id>', methods=['GET'])
def get_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({'error': 'Action not found'}), 404
    return jsonify(action_to_dict(action))
