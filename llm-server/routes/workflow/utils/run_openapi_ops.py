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
from werkzeug.datastructures import Headers
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


async def run_openapi_operations(
    record: WorkflowDataType,
    swagger_json: ResolvingParser,
    text: str,
    headers: Headers,
    server_base_url: str,
    app: Optional[str],
    bot_id: str,
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
                api_payload = await generate_openapi_payload(
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
                    logger.info("Making API call", incident="make_api_call", body=json.dumps(api_payload.body_schema), params=api_payload.query_params)

                    api_response = make_api_request(
                        headers=headers, **api_payload.__dict__
                    )

                    try:
                        api_response.json()
                    except ValueError:
                        raise ValueError("API response is not JSON")

                except Exception as e:
                    logger.error("Error occurred while making API call", incident="make_api_call_failed", error=str(e))
                    raise e

                logger.info("Got the following api response", text = api_response.text)
                # if a custom transformer function is defined for this operationId use that, otherwise forward it to the llm
                # so we don't necessarily have to defined mappers for all api endpoints
                partial_json = load_json_config(app, operation_id)
                if not partial_json:
                    logger.warn(
                        "Config map is not defined for this operationId",
                        incident="config_map_undefined",
                        operation_id=operation_id,
                        app=app
                    )
                    record_info[operation_id] = api_response.text
                    
                    # Removed this because this slows down the bot response instead of speeding it
                    # record_info[operation_id] = transform_api_response_from_schema(
                    #     api_payload.endpoint or "", api_response.text
                    # )
                    
                    pass
                else:
                    logger.info(
                        "API Response",
                        incident="log_api_response",
                        api_response=api_response.text,
                        json_config_used=partial_json,
                        next_action="summarize_with_partial_json",
                    )
                    api_json = json.loads(api_response.text)
                    record_info[operation_id] = json.dumps(
                        transform_response(
                            full_json=api_json, partial_json=partial_json
                        )
                    )

            except Exception as e:
                logger.error(
                    "Error occurred during workflow check in store",
                    incident="check_workflow_in_store",                    
                    text= text,
                    headers= headers,
                    server_base_url= server_base_url,
                    app= app,
                    error=str(e),
                )
    return convert_json_to_text(text, record_info, api_request_data, bot_id=bot_id)
