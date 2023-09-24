from bson import ObjectId
from utils.db import Database
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from routes.workflow.generate_openapi_payload import (
    generate_openapi_payload,
    load_openapi_spec,
)
from utils.make_api_call import make_api_request
from routes.workflow.typings.run_workflow_input import WorkflowData
from langchain.tools.json.tool import JsonSpec
from typing import List
from routes.workflow.hierarchical_planner import create_and_run_openapi_agent
import json

from typing import Any, Dict, Optional, cast, Union

db_instance = Database()
mongo = db_instance.get_db()


def get_valid_url(
    api_payload: Dict[str, Union[str, None]], server_base_url: Optional[str]
) -> str:
    if "path" in api_payload:
        path = api_payload["path"]

        # Check if path is a valid URL
        if path and path.startswith(("http://", "https://")):
            return path
        elif server_base_url and server_base_url.startswith(("http://", "https://")):
            # Append server_base_url to path
            return f"{server_base_url}{path}"
        else:
            raise ValueError("Invalid server_base_url")
    else:
        raise ValueError("Missing path parameter")


def run_workflow(data: WorkflowData) -> Any:
    text = data.text
    swagger_src = data.swagger_url
    headers = data.headers or {}
    # This will come from request payload later on when implementing multi-tenancy
    namespace = "workflows"
    server_base_url = data.server_base_url

    if not text:
        return json.dumps({"error": "text is required"}), 400

    vector_store = get_vector_store(StoreOptions(namespace))
    # documents = vector_store.similarity_search(text)

    (document, score) = vector_store.similarity_search_with_relevance_scores(text)[0]

    if score > 0.95:
        print(
            f"Record '{document}' is highly similar with a similarity score of {document}"
        )
        first_document_id = (
            ObjectId(document.metadata["workflow_id"]) if document else None
        )
        record = mongo.workflows.find_one({"_id": first_document_id})

        result = run_openapi_operations(
            record, swagger_src, text, headers, server_base_url
        )
        return result
    else:
        # call openapi spec
        result = create_and_run_openapi_agent(swagger_src, text, headers)
        return result


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

            api_payload["path"] = get_valid_url(api_payload, server_base_url)
            api_response = make_api_request(
                request_type=api_payload["request_type"],
                url=api_payload["path"],
                body=api_payload["body"],
                params=api_payload["params"],
                headers=headers,
            )
            record_info[operation_id] = json.loads(api_response.text)
            prev_api_response = api_response.text
        prev_api_response = ""
    return json.dumps(record_info)
