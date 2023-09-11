from flask import Blueprint, request, jsonify
from app import mongo
from validate_json import validate_json
from bson import ObjectId
from copilot_exceptions.handle_exceptions_and_errors import handle_exceptions_and_errors 
from utils.vector_db.qdrant import QdrantVectorDBClient
from utils.get_embeddings import get_embeddings
from opencopilot_types.workflow_type import WorkflowDataType
import warnings
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
    workflow_data: WorkflowDataType = request.json
    workflows = mongo.db.workflows
    workflow_id = workflows.insert_one(workflow_data).workflow_id

    qdrant_client = QdrantVectorDBClient()
    namespace = "workflows"
    # Check if the namespace is generic
    if namespace == "workflows":
        warning_message = "Warning: The 'namespace' variable is set to the generic value 'workflows'. You should replace it with a specific value for your org / user / account."
        warnings.warn(warning_message, UserWarning)
    
    add_workflow_data_to_qdrant(qdrant_client, namespace, workflow_id, workflow_data)
    return jsonify({'message': 'Workflow created', 'workflow_id': str(workflow_id)}), 201

@bp.route('/workflow/<workflow_id>', methods=['PUT'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def update_workflow(workflow_id):
    workflow_data: WorkflowDataType = request.json
    mongo.db.workflows.update_one({'_id': ObjectId(workflow_id)}, {'$set': workflow_data})
    qdrant_client = QdrantVectorDBClient()
    qdrant_client.delete_documents_by_workflow_id(workflow_id)
    namespace = "workflows"
    # Check if the namespace is generic
    if namespace == "workflows":
        warning_message = "Warning: The 'namespace' variable is set to the generic value 'workflows'. You should replace it with a specific value for your org / user / account."
        warnings.warn(warning_message, UserWarning)
    
    add_workflow_data_to_qdrant(qdrant_client, namespace, workflow_id, workflow_data)

    return jsonify({'message': 'Workflow updated'}), 200

@bp.route('/workflow/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    mongo.db.workflows.delete_one({'_id': workflow_id})
    return jsonify({'message': 'Workflow deleted'}), 200


def add_workflow_data_to_qdrant(qdrant_client, namespace, workflow_id, workflow_data, embedding_provider):
    embedding_provider = get_embeddings()
    for flow in workflow_data["flows"]:
        vectors = embedding_provider.embed_query(flow["description"])
        meta = {"workflow_id": str(workflow_id), "workflow_name": workflow_data.get("name")}
        qdrant_client.add_data_with_meta(namespace, vectors, meta)

