from flask import Blueprint, jsonify, request
from routes.action.dtos.action_dto import ActionCreate
from models.repository.action_repo import list_all_actions, action_to_dict, create_action, find_action_by_id


action = Blueprint('action', __name__)


@action.route('/bot/<string:chatbot_id>', methods=['GET'])
def get_actions(chatbot_id):
    actions = list_all_actions(chatbot_id)
    return jsonify([action_to_dict(action) for action in actions])



@action.route('/bot/<string:chatbot_id>', methods=['POST'])
def add_action(chatbot_id):
    data = ActionCreate(chatbot_id=chatbot_id, **request.get_json()) 
    
    action = create_action(data)

    return jsonify(action), 201


@action.route('/<string:action_id>', methods=['GET'])
def get_action(action_id):
    action = find_action_by_id(action_id)
    if action is None:
        return jsonify({'error': 'Action not found'}), 404
    return jsonify(action_to_dict(action))
