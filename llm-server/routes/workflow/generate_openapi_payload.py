import re
import os
import json
from utils.get_llm import get_llm
from dotenv import load_dotenv
from routes.workflow.extractors.extract_param import gen_params_from_schema
from routes.workflow.extractors.extract_body import gen_body_from_schema
from typing import Any, Optional

from prance import ResolvingParser
import asyncio

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


from typing import Any, Optional, List


# get path param, query param and json body schema for a given operation id
from typing import Optional
from routes.workflow.api_info import ApiInfo


def get_api_info_by_operation_id(data: Any, target_operation_id: str) -> ApiInfo:
    api_info = ApiInfo(
        endpoint=None,
        method=None,
        path_params={},
        query_params={},
        body_schema=None,
        servers=[],
    )

    for path, methods in data["paths"].items():
        for method, details in methods.items():
            if (
                "operationId" in details
                and details["operationId"] == target_operation_id
            ):
                # Extract endpoint and method
                api_info.endpoint = path
                api_info.method = method.upper()

                all_params = details.get("parameters", [])
                api_info.path_params = {
                    "properties": [obj for obj in all_params if obj["in"] == "path"]
                }

                api_info.query_params = {
                    "properties": [obj for obj in all_params if obj["in"] == "query"]
                }

                # Extract request body schema
                if "requestBody" in details:
                    request_body = details["requestBody"]
                    if (
                        "content" in request_body
                        and "application/json" in request_body["content"]
                    ):
                        api_info.body_schema = request_body["content"][
                            "application/json"
                        ]["schema"]

                # Extract server URLs
                servers = data.get("servers", [])
                server_urls = [server["url"] for server in servers]
                api_info.servers = server_urls

    return api_info


def extract_json_payload(input_string: str) -> Optional[Any]:
    # Remove all whitespace characters
    input_string = re.sub(r"\s", "", input_string)

    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)
    return json.loads(match[0]) if match else None


def generate_openapi_payload(
    swagger_json: ResolvingParser,
    text: str,
    _operation_id: str,
    prev_api_response: str,
    app: Optional[str],
    current_state: Optional[str],
) -> ApiInfo:
    async def process_api_info():
        a, b, c = swagger_json.version_parsed
        print(a, b, c)

        api_info = get_api_info_by_operation_id(
            swagger_json.specification, _operation_id
        )

        if api_info.path_params["properties"]:
            api_info.path_params = await gen_params_from_schema(
                json.dumps(api_info.path_params, separators=(",", ":")),
                text,
                prev_api_response,
                current_state,
            )

        if api_info.query_params["properties"]:
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

    return asyncio.run(process_api_info())
