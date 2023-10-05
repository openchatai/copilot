import json
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
import traceback
import logging
from typing import Any

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
            try:
                operation_id = step.get("open_api_operation_id")
                api_payload = generate_openapi_payload(
                    swagger_json, text, operation_id, prev_api_response
                )

                api_response = make_api_request(headers=headers, **api_payload.__dict__)
                record_info[operation_id] = json.loads(api_response.text)
                prev_api_response = api_response.text

            except Exception as e:
                logging.error("Error making API call", exc_info=True)

                error_info = {
                    "operation_id": operation_id,
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                }

                record_info[operation_id] = error_info

        prev_api_response = ""
    return json.dumps(record_info)