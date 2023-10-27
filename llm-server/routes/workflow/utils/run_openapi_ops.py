import json
from opencopilot_types.workflow_type import WorkflowDataType
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
import traceback
import logging
from typing import Any, Optional
from routes.workflow.extractors.transform_api_response import (
    transform_api_response_from_schema,
)
from routes.workflow.extractors.convert_json_to_text import convert_json_to_text
from utils.process_app_state import process_state
from prance import ResolvingParser
from integrations.load_json_config import load_json_config
from integrations.transformers.transformer import transform_response


def run_openapi_operations(
    record: WorkflowDataType,
    swagger_json: ResolvingParser,
    text: str,
    headers: Any,
    server_base_url: str,
    app: Optional[str],
) -> str:
    prev_api_response = ""
    record_info = {"Workflow Name": record.get("name")}
    current_state = process_state(app, headers)
    for flow in record.get("flows", []):
        for step in flow.get("steps"):
            try:
                # refresh state after every api call, we can look into optimizing this later as well
                operation_id = step.get("open_api_operation_id")
                api_payload = generate_openapi_payload(
                    swagger_json,
                    text,
                    operation_id,
                    prev_api_response,
                    app,
                    current_state,
                )

                api_response = make_api_request(headers=headers, **api_payload.__dict__)

                # if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm
                # so we don't necessarily have to defined mappers for all api endpoints
                partial_json = load_json_config(app, operation_id)
                if not partial_json:
                    transformed_response = transform_api_response_from_schema(
                        api_payload.endpoint or "", api_response.text
                    )
                else:
                    api_json = json.loads(api_response.text)
                    transformed_response = json.dumps(
                        transform_response(
                            full_json=api_json, partial_json=partial_json
                        )
                    )

                prev_api_response = prev_api_response + transformed_response
                record_info[operation_id] = json.loads(api_response.text)

            except Exception as e:
                logging.error("Error making API call", exc_info=True)

                error_info = {
                    "operation_id": operation_id,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }
                record_info[operation_id] = error_info

                # At this point we will retry the operation with hierarchical planner
                raise e
    return convert_json_to_text(text, prev_api_response)
