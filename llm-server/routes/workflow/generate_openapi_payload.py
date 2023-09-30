import re
import os
import json
from utils.get_llm import get_llm
from dotenv import load_dotenv
from .extractors.example_generator import gen_ex_from_schema
from routes.workflow.extractors.extract_param import gen_params_from_schema
from routes.workflow.extractors.extract_body import gen_body_from_schema
from typing import Dict, Any, Optional

from prance import ResolvingParser

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


from typing import Dict, Any, Optional, List


# get path param, query param and json body schema for a given operation id
from typing import Dict, Optional, List
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

                # Extract path parameters and their schemas
                path_params = {}
                for parameter in details.get("parameters", []):
                    if parameter["in"] == "path":
                        param_name = parameter["name"]
                        param_schema = parameter.get("schema", {})
                        path_params[param_name] = param_schema
                api_info.path_params = path_params

                # Extract query parameters and their schemas
                query_params = {}
                for parameter in details.get("parameters", []):
                    if parameter["in"] == "query":
                        param_name = parameter["name"]
                        param_schema = parameter.get("schema", {})
                        query_params[param_name] = param_schema
                api_info.query_params = query_params

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
    swagger_json: str, text: str, _operation_id: str, prev_api_response: str
) -> ApiInfo:
    parser = ResolvingParser(spec_string=swagger_json)
    (a, b, c) = parser.version_parsed  # (3,0,2), we can then apply transformation on
    print(a, b, c)
    # add transformation for swagger v2

    api_info = get_api_info_by_operation_id(parser.specification, _operation_id)

    api_info.path_params = (
        {}
        if not api_info.path_params
        else gen_params_from_schema(
            json.dumps(api_info.path_params), text, prev_api_response
        )
    )
    api_info.query_params = (
        {}
        if not api_info.query_params
        else gen_params_from_schema(
            json.dumps(api_info.query_params), text, prev_api_response
        )
    )

    if api_info.body_schema:
        example = gen_ex_from_schema(api_info.body_schema)
        api_info.body_schema = gen_body_from_schema(
            json.dumps(api_info.body_schema), text, prev_api_response, example
        )
    else:
        api_info.body_schema = {}

    return api_info
