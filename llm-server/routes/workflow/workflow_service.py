from bson import ObjectId
from utils.db import Database
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
import json

from typing import Any, Dict, Optional, cast

db_instance = Database()
mongo = db_instance.get_db()


def run_workflow(data: Dict[str, Any]) -> Any:
    text = data.get("text")
    swagger_src = cast(str, data.get("swagger_src"))
    headers = data.get("headers", {})
    # This will come from request payload later on when implementing multi-tenancy
    namespace = "workflows"
    server_base_url = cast(str, data.get("server_base_url"))

    if not text:
        return json.dumps({"error": "text is required"}), 400

    vector_store = get_vector_store(StoreOptions(namespace))
    documents = vector_store.similarity_search(text)

    first_document_id = (
        ObjectId(documents[0].metadata["workflow_id"]) if documents else None
    )
    record = mongo.workflows.find_one({"_id": first_document_id})

    result = run_openapi_operations(record, swagger_src, text, headers, server_base_url)
    return result, 200, {"Content-Type": "application/json"}


def run_openapi_operations(
    record: Any,
    swagger_src: str,
    text: str,
    headers: Any,
    server_base_url: str,
) -> str:
    record_info = {"Workflow Name": record.get("name")}
    for flow in record.get("flows", []):
        prev_api_response = ""
        for step in flow.get("steps"):
            operation_id = step.get("open_api_operation_id")
            api_payload = generate_openapi_payload(
                swagger_src, text, operation_id, prev_api_response
            )

            api_payload["path"] = f"{server_base_url}{api_payload['path']}"
            api_response = make_api_request(
                request_type=api_payload["request_type"],
                url=api_payload["path"],
                body=api_payload["body"],
                params=api_payload["params"],
                headers=headers,
            )
            record_info[operation_id] = api_response.text
            prev_api_response = api_response.text
        prev_api_response = ""
    return json.dumps(record_info)
