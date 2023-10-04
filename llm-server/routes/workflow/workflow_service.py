import json
from typing import Any, Dict, Optional, Union

from bson import ObjectId
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from routes.workflow.hierarchical_planner import create_and_run_openapi_agent
from routes.workflow.typings.run_workflow_input import WorkflowData
from utils.db import Database
from utils.make_api_call import make_api_request
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions

db_instance = Database()
mongo = db_instance.get_db()

import os
import logging

SCORE_THRESOLD = float(os.getenv("SCORE_THRESOLD", 0.88))


def get_valid_url(
        api_payload: Dict[str, Union[str, None]], server_base_url: Optional[str]
) -> str:
    if "endpoint" in api_payload:
        endpoint = api_payload["endpoint"]

        # Check if path is a valid URL
        if endpoint and endpoint.startswith(("http://", "https://")):
            return endpoint
        elif server_base_url and server_base_url.startswith(("http://", "https://")):
            # Append server_base_url to endpoint
            return f"{server_base_url}{endpoint}"
        else:
            raise ValueError("Invalid server_base_url")
    else:
        raise ValueError("Missing path parameter")


def run_workflow(data: WorkflowData, swagger_json: Any, needed_calls: Any) -> Any:
    logging.info(
        "[OpenCopilot] Trying to map the user request with a flow (since the request need multiple API calls)"
    )
    text = data.text
    headers = data.headers or {}
    # This will come from the request payload later on when implementing multi-tenancy
    namespace = "workflows"
    server_base_url = data.server_base_url

    if not text:
        return json.dumps({"error": "text is required"}), 400

    try:
        vector_store = get_vector_store(StoreOptions(namespace=data.swagger_url))
        (document, score) = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=SCORE_THRESOLD
        )[0]

        logging.info(
            f"[OpenCopilot] Record '{document}' is highly similar with a similarity score of {score} which means "
            f"we can run this flow"
        )
        first_document_id = (
            ObjectId(document.metadata["workflow_id"]) if document else None
        )
        record = mongo.workflows.find_one({"_id": first_document_id})

        result = run_openapi_operations(
            record, swagger_json, text, headers, server_base_url
        )
        return {"response": result}

    except Exception as e:
        # Log the error, but continue with the rest of the code
        logging.info(f"[OpenCopilot] Error fetching data from namespace '{namespace}': {str(e)}")

    logging.info(f"[OpenCopilot] Could not map the user request to a flow, last attempt is to run the hierarchical "
                 f"planning AI")

    # Since we could not map the user request to a flow, we will try to generate one on the fly
    generated_flow = generate_workflow_on_the_fly_based_on_the_user_request(needed_calls, swagger_json)

    # Now let's try to call the flow
    # todo

    # Otherwise, let's call the agents.
    result = create_and_run_openapi_agent(swagger_json, text, headers)

    logging.info("[OpenCopilot] Planner out come {}".format(json.dumps({"response": result})))
    return {"response": result}


def generate_workflow_on_the_fly_based_on_the_user_request(needed_calls, swagger_doc):

    pass

def run_openapi_operations(
        record: Any,
        swagger_json: str,
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
                swagger_json, text, operation_id, prev_api_response
            )

            api_response = make_api_request(headers=headers, **api_payload.__dict__)
            record_info[operation_id] = json.loads(api_response.text)
            prev_api_response = api_response.text
        prev_api_response = ""
    return json.dumps(record_info)
