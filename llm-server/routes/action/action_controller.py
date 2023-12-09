from http import HTTPStatus
from flask import Blueprint, jsonify, request
from routes.action.dtos.action_dto import ActionCreate
from models.repository.action_repo import action_to_dict, create_action, find_action_by_id
from werkzeug import Response
from . import action_service
from utils.get_logger import CustomLogger
action = Blueprint('action', __name__)

logger = CustomLogger(__name__)

@action.route("/<chatbot_id>", methods=["GET"])
def get_actions(chatbot_id: str):
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))
    records = action_service.get_all_actions(chatbot_id, limit, offset)
    
    logger.info("Found records", records=records)
    return jsonify(records)

@action.route('/bot/<string:chatbot_id>', methods=['POST'])
def add_action(chatbot_id):
    data = ActionCreate(chatbot_id=chatbot_id, **request.get_json()) 
    action = action_service.create_action(data)
    return jsonify(action), 201


@action.route('/p/<string:point_id>', methods=['GET'])
def get_action(point_id):
    action = action_service.get_action(point_id)
    return jsonify(action.model_dump())


@action.route('/<string:point_id>', methods=["PUT"])
def update_action(point_id: str):    
    action = ActionCreate(**request.get_json())
    action_service.update_action(action=action, point_id=point_id)
    return Response(status=HTTPStatus.ACCEPTED)


@action.route('/<string:point_id>', methods=["DELETE"])
def delete_action(point_id: str):    
    action_service.delete_action(point_id)
    return Response(status=HTTPStatus.ACCEPTED)