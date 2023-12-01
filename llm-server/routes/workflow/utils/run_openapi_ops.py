import json
from opencopilot_types.workflow_type import WorkflowDataType
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
from typing import Any, Optional
from routes.workflow.extractors.transform_api_response import (
    transform_api_response_from_schema,
)
from routes.workflow.extractors.convert_json_to_text import convert_json_to_text
from utils.process_app_state import process_state
from prance import ResolvingParser
from integrations.load_json_config import load_json_config
from integrations.transformers.transformer import transform_response
from utils import struct_log
from werkzeug.datastructures import Headers

def run_openapi_operations(
    record: WorkflowDataType,
    swagger_json: ResolvingParser,
    text: str,
    headers: Headers,
    server_base_url: str,
    app: Optional[str],
) -> str:
    api_request_data = {}
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

                api_request_data[operation_id] = api_payload.__dict__
                api_response = None
                try:
                    struct_log.info(payload=api_payload.__dict__, event="make_api_call")

                    api_response = make_api_request(
                        headers=headers, **api_payload.__dict__
                    )

                    try:
                        api_response.json()
                    except ValueError:
                        raise ValueError("API response is not JSON")

                except Exception as e:
                    struct_log.exception(error=str(e), event="make api call failed")
                    return {}

                # if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm
                # so we don't necessarily have to defined mappers for all api endpoints
                partial_json = load_json_config(app, operation_id)
                struct_log.info(event="load_json_config", json_config=partial_json)
                if not partial_json:
                    struct_log.error(
                        event="load_json_config",
                        error="Failed to find a config map, consider adding a config map for this operation id",
                        operation_id=operation_id,
                    )
                    record_info[operation_id] = transform_api_response_from_schema(
                        api_payload.endpoint or "", api_response.text
                    )
                else:
                    struct_log.info(
                        event="api_response",
                        text=api_response.text,
                        message="Truncate unnecessary info using json_config provided",
                    )
                    api_json = json.loads(api_response.text)
                    record_info[operation_id] = json.dumps(
                        transform_response(
                            full_json=api_json, partial_json=partial_json
                        )
                    )

            except Exception as e:
                struct_log.exception(
                    payload=json.dumps(
                        {
                            "text": text,
                            "headers": headers,
                            "server_base_url": server_base_url,
                            "app": app,
                        }
                    ),
                    error=str(e),
                    event="/check_workflow_in_store",
                )

    return convert_json_to_text(text, record_info, app, api_request_data)
