from flask import Blueprint, request, jsonify
from routes.workflow.validate_json import validate_json
from bson import ObjectId
from copilot_exceptions.handle_exceptions_and_errors import handle_exceptions_and_errors 
from utils.vector_db.qdrant import QdrantVectorDBClient
from utils.get_embeddings import get_embeddings
from opencopilot_types.workflow_type import WorkflowDataType
import warnings
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

workflow = Blueprint('workflow', __name__)

import json
import os

json_file_path = os.path.join(os.getcwd(), 'routes', 'workflow', 'workflow_schema.json')
with open(json_file_path, 'r') as workflow_schema_file:
    workflow_schema = json.load(workflow_schema_file)

@workflow.route('/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    workflow = mongo.db.workflows.find_one_or_404({'_id': workflow_id})
    return jsonify(workflow), 200

@workflow.route('/', methods=['POST'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def create_workflow():
    workflow_data: WorkflowDataType = request.json
    workflows = mongo.db.workflows
    workflow_id = workflows.insert_one(workflow_data).inserted_id

    qdrant_client = QdrantVectorDBClient()
    namespace = "workflows"
    # Check if the namespace is generic
    if namespace == "workflows":
        warning_message = "Warning: The 'namespace' variable is set to the generic value 'workflows'. You should replace it with a specific value for your org / user / account."
        warnings.warn(warning_message, UserWarning)
    embedding = get_embeddings()
    add_workflow_data_to_qdrant(qdrant_client, namespace, workflow_id, workflow_data, embedding)

    return jsonify({'message': 'Workflow created', 'workflow_id': str(workflow_id)}), 201

@workflow.route('/<workflow_id>', methods=['PUT'])
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

@workflow.route('/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    mongo.db.workflows.delete_one({'_id': workflow_id})
    return jsonify({'message': 'Workflow deleted'}), 200

@workflow.route('/run_workflow', methods=['POST'])
@handle_exceptions_and_errors
def run_workflow():
    """
    Run a workflow based on text input and a namespace.

    This API endpoint receives a JSON payload containing 'text' and 'namespace'.
    It queries Qdrant for relevant records using the input text, retrieves metadata
    from MongoDB based on Qdrant results, and then iterates over workflow items
    to print their information.
    """
    data = request.json
    text = data.get("text")
    namespace = data.get("namespace")

    qdrant_client = QdrantVectorDBClient()
    # Query Qdrant for relevant records
    qdrant_results = qdrant_client.perform_search(namespace, text)

    # Retrieve metadata from MongoDB using Qdrant results
    relevant_workflow_ids = [result["meta"]["workflow_id"] for result in qdrant_results]
    relevant_records = mongo.db.workflows.find({"_id": {"$in": relevant_workflow_ids}})

    # Iterate over relevant records and print workflow items
    record = relevant_records[0]
    print(f"Workflow Name: {record.get('name')}")
    for flow in record.get("flows", []):
        print(f"Flow Description: {flow.get('description')}")
        # Print other relevant flow data as needed

    return jsonify({"message": "Workflow run completed"}), 200


def add_workflow_data_to_qdrant(qdrant_client: QdrantVectorDBClient, namespace, workflow_id, workflow_data, embedding_provider):
    embedding_provider = get_embeddings()
    for flow in workflow_data["flows"]:
        vectors = embedding_provider.embed_query(flow["description"])
        meta = {"workflow_id": str(workflow_id), "workflow_name": workflow_data.get("name")}
        qdrant_client.add_data_with_meta(namespace, vectors, meta)