import json
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


def run_openapi_operations(
    record: Any,
    swagger_json: str,
    text: str,
    headers: Any,
    server_base_url: str,
    app: Optional[str],
) -> str:
    prev_api_response = ""
    record_info = {"Workflow Name": record.get("name")}
    for flow in record.get("flows", []):
        for step in flow.get("steps"):
            try:
                # refresh state after every api call, we can look into optimizing this later as well
                current_state = process_state(app, headers)
                operation_id = step.get("open_api_operation_id")
                api_payload = generate_openapi_payload(
                    swagger_json, text, operation_id, prev_api_response, current_state
                )

                api_response = make_api_request(headers=headers, **api_payload.__dict__)

                # intended change here:
                # transformer_function = transformer_functions.get((app, method, api_endpoint))
                # if transformer_function:
                #     return transformer_function(api_payload, api_response)
                # else:
                #     return transform_api_response_from_schema(api_payload.endpoint or "",
                #                                             api_response.text)
                transformed_response = transform_api_response_from_schema(
                    api_payload.endpoint or "", api_response.text
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
