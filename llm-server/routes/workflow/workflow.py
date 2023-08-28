from flask import Blueprint, request, jsonify
from app import mongo
from validate_json import validate_json
from bson import ObjectId
from copilot_exceptions.handle_exceptions_and_errors import handle_exceptions_and_errors 
bp = Blueprint('workflow', __name__)
import json

with open('workflow_schema.json', 'r') as workflow_schema_file:
    workflow_schema = json.load(workflow_schema_file)

@bp.route('/workflow/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    workflow = mongo.db.workflows.find_one_or_404({'_id': workflow_id})
    return jsonify(workflow), 200

@bp.route('/workflow', methods=['POST'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def create_workflow():
    workflow_data = request.json
    workflows = mongo.db.workflows
    inserted_id = workflows.insert_one(workflow_data).inserted_id
    return jsonify({'message': 'Workflow created', 'inserted_id': str(inserted_id)}), 201

@bp.route('/workflow/<workflow_id>', methods=['PUT'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def update_workflow(workflow_id):
    updated_workflow = request.json
    mongo.db.workflows.update_one({'_id': ObjectId(workflow_id)}, {'$set': updated_workflow})
    return jsonify({'message': 'Workflow updated'}), 200

@bp.route('/workflow/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    mongo.db.workflows.delete_one({'_id': workflow_id})
    return jsonify({'message': 'Workflow deleted'}), 200
