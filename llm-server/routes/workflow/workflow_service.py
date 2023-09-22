from bson import ObjectId
from utils.db import Database
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from opencopilot_types.workflow_type import RunApiOperationsType
from utils.make_api_call import make_api_request
from routes.workflow.extractors.user_confirmation_form import UserConfirmationForm
from routes.workflow.typings.run_workflow_input import WorkflowData
import json

from typing import Any, Dict, Union, Optional

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
    headers = data.headers
    # This will come from request payload later on when implementing multi-tenancy
    namespace = "workflows"
    server_base_url = data.server_base_url

    if not text:
        return json.dumps({"error": "text is required"}), 400

    vector_store = get_vector_store(StoreOptions(namespace))
    # documents = vector_store.similarity_search(text)

    (document, score) = vector_store.similarity_search_with_relevance_scores(text)[0]

    first_document_id = ObjectId(document.metadata["workflow_id"]) if document else None
    record = mongo.workflows.find_one({"_id": first_document_id})
    result = run_openapi_operations(
        RunApiOperationsType(record, swagger_src, text, headers, server_base_url, None)
    )
    return result, 200, {"Content-Type": "application/json"}


def run_openapi_operations(
    input: RunApiOperationsType,
) -> str:
    record_info = {"Workflow Name": input.record.get("name")}
    for flow in input.record.get("flows", []):
        prev_api_response = ""
        for step in flow.get("steps"):
            operation_id = step.get("open_api_operation_id")

            if (
                input.api_payload is not None
            ):  # This can come from the frontend, because the user will fill in json form that we sent, which actually matches the api definition.
                pass

            else:
                api_payload = generate_openapi_payload(
                    input.swagger_src, input.text, operation_id, prev_api_response
                )

                if isinstance(api_payload, UserConfirmationForm):
                    return json.dumps(api_payload)

                api_payload["path"] = f"{input.server_base_url}{api_payload['path']}"
                api_response = make_api_request(
                    request_type=api_payload["request_type"],
                    url=api_payload["path"],
                    body=api_payload["body"],
                    params=api_payload["params"],
                    headers=input.headers,
                )
                record_info[operation_id] = json.loads(api_response.text)
                prev_api_response = api_response.text
        prev_api_response = ""

    return json.dumps(record_info)
