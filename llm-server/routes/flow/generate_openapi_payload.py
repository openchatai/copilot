import json
import os
from typing import Optional

from entities.action_entity import ActionDTO
from extractors.extract_body import gen_body_from_schema
from extractors.extract_param import gen_params_from_schema
from routes.flow.api_info import ApiInfo
from shared.utils.opencopilot_utils import get_llm
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


async def generate_api_payload(
    text: str,
    action: ActionDTO,
    prev_api_response: str,
    app: Optional[str],
    current_state: Optional[str],
) -> ApiInfo:
    payload = action.payload

    parameters = payload.get("parameters", [])

    # Extract path and query parameters, ensure they have 'name' and 'in' keys
    path_params = {
        param["name"]: param
        for param in parameters
        if param.get("in") == "path" and "name" in param
    }
    query_params = {
        param["name"]: param
        for param in parameters
        if param.get("in") == "query" and "name" in param
    }

    # Extract body schema, handle different content types
    request_body = payload.get("request_body", {}).get("content", {})
    # Default to empty schema if specific content type not found
    body_schema = request_body.get("application/json", {}).get("schema", {})

    # Assuming action.api_endpoint and action.request_type are provided
    api_info = ApiInfo(
        endpoint=action.api_endpoint,
        method=action.request_type,
        path_params=path_params,
        query_params=query_params,
        body_schema=body_schema,
    )

    if api_info.path_params:
        api_info.path_params = await gen_params_from_schema(
            json.dumps(api_info.path_params, separators=(",", ":")),
            text,
            prev_api_response,
            current_state,
        )

    if api_info.query_params:
        api_info.query_params = await gen_params_from_schema(
            json.dumps(api_info.query_params, separators=(",", ":")),
            text,
            prev_api_response,
            current_state,
        )

    if api_info.body_schema:
        api_info.body_schema = await gen_body_from_schema(
            json.dumps(api_info.body_schema, separators=(",", ":")),
            text,
            prev_api_response,
            app,
            current_state,
        )
    else:
        api_info.body_schema = {}

    return api_info
