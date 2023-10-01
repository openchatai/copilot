from bson import ObjectId
from utils.db import Database
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
from routes.workflow.typings.run_workflow_input import WorkflowData
from langchain.tools.json.tool import JsonSpec
from typing import List
from routes.workflow.hierarchical_planner import create_and_run_openapi_agent
import json
import logging
import traceback

logger = logging.getLogger(__name__)

from typing import Any, Dict, Optional, cast, Union

db_instance = Database()
mongo = db_instance.get_db()

import os

SCORE_THRESHOLD = float(os.getenv("SCORE_THRESHOLD", 0.88))


def check_workflow_in_vector_store(data: WorkflowData):
    text = data.text
    namespace = "workflows"

    if not text:
        return None, 400

    try:
        vector_store = get_vector_store(StoreOptions(namespace=namespace))
        (document, score) = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=SCORE_THRESHOLD
        )[0]

        print(
            f"Record '{document}' is highly similar with a similarity score of {score}"
        )
        first_document_id = (
            ObjectId(document.metadata["workflow_id"]) if document else None
        )
        record = mongo.workflows.find_one({"_id": first_document_id})
        return record
    except Exception as e:
        print(f"Error fetching data from namespace '{namespace}': {str(e)}")
        return None


def run_openapi(record, swagger_json, data: WorkflowData):
    if record:
        return run_openapi_operations(
            record, swagger_json, data.text, data.headers, data.server_base_url
        )
    else:
        return create_and_run_openapi_agent(swagger_json, data.text, data.headers)


def run_workflow(data: WorkflowData, swagger_json: Any) -> Any:
    record = check_workflow_in_vector_store(data)
    run_workflow_final(record, swagger_json, data)


def run_workflow_final(record: Any, swagger_json: Any, data: WorkflowData):
    result = run_openapi(record, swagger_json, data)
    return {"response": result}


def run_openapi_operations(record, swagger_json, text, headers, server_base_url):
    record_info = {"Workflow Name": record.get("name")}

    for flow in record.get("flows", []):
        prev_api_response = ""

        for step in flow.get("steps"):
            try:
                operation_id = step.get("open_api_operation_id")
                api_payload = generate_openapi_payload(
                    swagger_json, text, operation_id, prev_api_response
                )

                api_response = make_api_request(headers=headers, **api_payload.__dict__)
                record_info[operation_id] = json.loads(api_response.text)
                prev_api_response = api_response.text

            except Exception as e:
                logger.error("Error making API call", exc_info=True)

                error_info = {
                    "operation_id": operation_id,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }

                record_info[operation_id] = error_info

        prev_api_response = ""

    return json.dumps(record_info)
