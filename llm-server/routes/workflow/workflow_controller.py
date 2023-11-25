import json
import os
from typing import Any, cast

from bson import ObjectId, json_util
from copilot_exceptions.handle_exceptions_and_errors import handle_exceptions_and_errors
from utils.vector_db.add_workflow import add_workflow_data_to_qdrant
from flask import Blueprint, request, jsonify
from opencopilot_types.workflow_type import WorkflowDataType
from routes.workflow.validate_json import validate_json
from utils.db import Database
from opencopilot_utils import get_vector_store, StoreOptions

db_instance = Database()
mongo = db_instance.get_db()

workflow = Blueprint("flows", __name__)

json_file_path = os.path.join(os.getcwd(), "routes", "workflow", "workflow_schema.json")
with open(json_file_path, "r") as workflow_schema_file:
    workflow_schema = json.load(workflow_schema_file)


@workflow.route("/<workflow_id>", methods=["GET"])
def get_workflow(workflow_id: str) -> Any:
    workflow = mongo.workflows.find_one({"_id": ObjectId(workflow_id)})
    if workflow:
        workflow = json_util.dumps(workflow)
        return workflow, 200, {"Content-Type": "application/json"}

    else:
        return jsonify({"message": "Workflow not found"}), 404


@workflow.route("/u/<swagger_url>/b/<bot_id>", methods=["POST"])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def create_workflow(swagger_url: str, bot_id: str) -> Any:
    workflow_data = cast(WorkflowDataType, request.json)
    workflows = mongo.workflows
    workflow_id = workflows.insert_one(workflow_data).inserted_id

    add_workflow_data_to_qdrant(
        workflow_id, workflow_data, bot_id=workflow_data.get("bot_id")
    )

    return (
        jsonify({"message": "Workflow created", "workflow_id": str(workflow_id)}),
        201,
    )


@workflow.route("/b/<bot_id>", methods=["GET", "POST"])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def create_workflow_by_bot_id(bot_id: str) -> Any:
    workflow_data = cast(WorkflowDataType, request.json)
    swagger_url = ""
    workflow_data["bot_id"] = bot_id
    workflows = mongo.workflows
    workflow_id = workflows.insert_one(workflow_data).inserted_id

    add_workflow_data_to_qdrant(workflow_id, workflow_data, bot_id)

    return (
        jsonify({"message": "Workflow created", "workflow_id": str(workflow_id)}),
        201,
    )


@workflow.route("/get/b/<bot_id>", methods=["GET"])
def get_workflows_by_bot_id(bot_id: str) -> Any:
    # Define default page and page_size values
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    # Calculate skip value based on page and page_size
    skip = (page - 1) * page_size

    # Query MongoDB to get a paginated list of workflows
    workflows = list(
        mongo.workflows.find({"bot_id": bot_id}).skip(skip).limit(page_size)
    )

    for workflow in workflows:
        workflow["_id"] = str(workflow["_id"])

    # Calculate the total number of workflows (for pagination metadata)
    total_workflows = mongo.workflows.count_documents({"bot_id": bot_id})

    # Prepare response data
    response_data = {
        "workflows": workflows,
        "page": page,
        "page_size": page_size,
        "total_workflows": total_workflows,
    }

    return jsonify(response_data), 200


@workflow.route("/s/<swagger_id>", methods=["GET"])
def get_workflows_by_swagger_id(swagger_id: str) -> Any:
    # Define default page and page_size values
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    # Calculate skip value based on page and page_size
    skip = (page - 1) * page_size

    # Query MongoDB to get a paginated list of workflows
    workflows = list(
        mongo.workflows.find({"swagger_id": swagger_id}).skip(skip).limit(page_size)
    )

    for workflow in workflows:
        workflow["_id"] = str(workflow["_id"])

    # Calculate the total number of workflows (for pagination metadata)
    total_workflows = mongo.workflows.count_documents({"swagger_id": swagger_id})

    # Prepare response data
    response_data = {
        "workflows": workflows,
        "page": page,
        "page_size": page_size,
        "total_workflows": total_workflows,
    }

    return jsonify(response_data), 200


@workflow.route("/<workflow_id>", methods=["PUT"])
@validate_json(workflow_schema)
@handle_exceptions_and_errors
def update_workflow(workflow_id: str) -> Any:
    workflow_data = cast(WorkflowDataType, request.json)
    result = mongo.workflows.update_one(
        {"_id": ObjectId(workflow_id)}, {"$set": workflow_data}
    )
    namespace = "workflows"
    vector_store = get_vector_store(StoreOptions(namespace))
    vector_store.delete(ids=[workflow_id])

    add_workflow_data_to_qdrant(
        workflow_id, workflow_data, result.raw_result.get("bot_id")
    )

    return jsonify({"message": "Workflow updated"}), 200


@workflow.route("/<workflow_id>", methods=["DELETE"])
def delete_workflow(workflow_id: str) -> Any:
    data = mongo.workflows.delete_one({"_id": ObjectId(workflow_id)})
    print(f"{data}")
    return jsonify({"message": "Workflow deleted"}), 200
