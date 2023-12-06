from flask import Blueprint, jsonify, request

from models.repository.action_repo import list_all_actions, action_to_dict, create_action, find_action_by_id

action = Blueprint('action', __name__)


@action.route('/bot/<string:chatbot_id>', methods=['GET'])
def get_actions(chatbot_id):
    actions = list_all_actions(chatbot_id)
    return jsonify([action_to_dict(action) for action in actions])


@action.route('/bot/<string:chatbot_id>', methods=['POST'])
def add_action(chatbot_id):
    data = request.json
    data['chatbot_id'] = chatbot_id  # Add chatbot_id to the data dictionary

    # Validate incoming data
    if not data.get("name"):
        return jsonify({"error": "name is required"}), 400

    try:
        action = create_action(**data)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    return jsonify(action), 201


@action.route('/<string:action_id>', methods=['GET'])
def get_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({'error': 'Action not found'}), 404
    return jsonify(action_to_dict(action))
