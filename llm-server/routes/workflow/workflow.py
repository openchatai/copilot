from flask import Blueprint, request, jsonify
from routes.workflow.validate_json import validate_json
from bson import ObjectId, json_util
from copilot_exceptions.handle_exceptions_and_errors import handle_exceptions_and_errors 
from utils.get_embeddings import get_embeddings
from opencopilot_types.workflow_type import WorkflowDataType
import warnings
from utils.db import Database
from utils.vector_db.init_vector_store import init_vector_store
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from langchain.docstore.document import Document

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
    workflow = mongo.workflows.find_one({'_id': ObjectId(workflow_id)})
    if workflow:
        workflow = json_util.dumps(workflow)
        return workflow, 200, {'Content-Type': 'application/json'}

    else:
        return jsonify({"message": "Workflow not found"}), 404

@workflow.route('/', methods=['POST'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def create_workflow():
    workflow_data: WorkflowDataType = request.json
    workflows = mongo.workflows
    workflow_id = workflows.insert_one(workflow_data).inserted_id

    namespace = "workflows"
    # Check if the namespace is generic
    if namespace == "workflows":
        warning_message = "Warning: The 'namespace' variable is set to the generic value 'workflows'. You should replace it with a specific value for your org / user / account."
        warnings.warn(warning_message, UserWarning)
    add_workflow_data_to_qdrant(namespace, workflow_id, workflow_data)

    return jsonify({'message': 'Workflow created', 'workflow_id': str(workflow_id)}), 201

@workflow.route('/<workflow_id>', methods=['PUT'])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def update_workflow(workflow_id):
    workflow_data: WorkflowDataType = request.json
    mongo.workflows.update_one({'_id': ObjectId(workflow_id)}, {'$set': workflow_data})
    vector_store = get_vector_store(StoreOptions(namespace))
    vector_store.delete(ids=[workflow_id])
    namespace = "workflows"
    # Check if the namespace is generic
    if namespace == "workflows":
        warning_message = "Warning: The 'namespace' variable is set to the generic value 'workflows'. You should replace it with a specific value for your org / user / account."
        warnings.warn(warning_message, UserWarning)
    
    add_workflow_data_to_qdrant(vector_store, namespace, workflow_id, workflow_data)

    return jsonify({'message': 'Workflow updated'}), 200

@workflow.route('/<workflow_id>', methods=['DELETE'])
def delete_workflow(workflow_id):
    mongo.workflows.delete_one({'_id': workflow_id})
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

    vector_store = get_vector_store(StoreOptions(namespace))
    documents = vector_store.similarity_search(text)

    relevant_workflow_ids = []
    for index, doc in enumerate(documents):
        relevant_workflow_ids.append(ObjectId(doc.metadata["workflow_id"]))
        
    relevant_records = mongo.workflows.find({"_id": {"$in": relevant_workflow_ids}})

    # Iterate over relevant records and print workflow items
    record = relevant_records[0]
    print(f"Workflow Name: {record.get('name')}")
    for flow in record.get("flows", []):
        for step in flow.get("steps"):
            print(step.get("open_api_operation_id"))
            # Take this operation id and the data provided in the request to call the api with the given open_api_operation_id
            # The store the response of that api to call the next api, we have to think as to how this response gets stored

    record = json_util.dumps(record)
    return record, 200, {'Content-Type': 'application/json'}



def add_workflow_data_to_qdrant(namespace: str, workflow_id: str, workflow_data):
    for flow in workflow_data["flows"]:
        docs = [
            Document(
                page_content=flow["description"],
                metadata={"workflow_id": str(workflow_id), "workflow_name": workflow_data.get("name")},
            )
        ]
        embeddings = get_embeddings()
        init_vector_store(docs, embeddings, StoreOptions(namespace))