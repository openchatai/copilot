import re
import os
import json
from langchain.tools.json.tool import JsonSpec
from utils.get_llm import get_llm
from dotenv import load_dotenv
from .extractors.example_generator import gen_ex_from_schema
from routes.workflow.extractors.extract_param import gen_params_from_schema
from routes.workflow.extractors.extract_body import gen_body_from_schema
from custom_types.t_json import JsonData
from custom_types.swagger import ApiOperation
from typing import Dict, Any, Optional, Union, Tuple
from routes.workflow.load_openapi_spec import load_openapi_spec

from prance import ResolvingParser
from prance import convert

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


from typing import Dict, Any, Optional, Union, List


# get path param, query param and json body schema for a given operation id
from typing import Dict, Union, Optional, List


def get_api_info_by_operation_id(
    data: Dict[str, Dict[str, dict]], target_operation_id: str
) -> Dict[str, Union[str, dict, Optional[Dict[str, dict]], List[str]]]:
    api_info = {
        "endpoint": None,
        "method": None,
        "path_params": {},
        "query_params": {},
        "body_schema": None,
        "servers": [],
    }

    for path, methods in data["paths"].items():
        for method, details in methods.items():
            if (
                "operationId" in details
                and details["operationId"] == target_operation_id
            ):
                # Extract endpoint and method
                api_info["endpoint"] = path
                api_info["method"] = method.upper()

                # Extract path parameters and their schemas
                path_params = {}
                for parameter in details.get("parameters", []):
                    if parameter["in"] == "path":
                        param_name = parameter["name"]
                        param_schema = parameter.get("schema", {})
                        path_params[param_name] = param_schema
                api_info["path_params"] = path_params

                # Extract query parameters and their schemas
                query_params = {}
                for parameter in details.get("parameters", []):
                    if parameter["in"] == "query":
                        param_name = parameter["name"]
                        param_schema = parameter.get("schema", {})
                        query_params[param_name] = param_schema
                api_info["query_params"] = query_params

                # Extract request body schema
                if "requestBody" in details:
                    request_body = details["requestBody"]
                    if (
                        "content" in request_body
                        and "application/json" in request_body["content"]
                    ):
                        api_info["body_schema"] = request_body["content"][
                            "application/json"
                        ]["schema"]

                # Extract server URLs
                servers = data.get("servers", [])
                server_urls = [server["url"] for server in servers]
                api_info["servers"] = server_urls

                return api_info


def extract_json_payload(input_string: str) -> Optional[Any]:
    # Remove all whitespace characters
    input_string = re.sub(r"\s", "", input_string)

    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)
    return json.loads(match[0]) if match else None


def generate_openapi_payload(
    swagger_text: str, text: str, _operation_id: str, prev_api_response: str
) -> Dict[str, Any]:
    if isinstance(spec_source, str):
        if spec_source.startswith(("http://", "https://")):
            spec_source = "/app/shared" + spec_source

    parser = ResolvingParser(spec_source)
    (a, b, c) = parser.version_parsed  # (3,0,2), we can then apply transformation on
    print(a, b, c)
    # add transformation for swagger v2

    api_info = get_api_info_by_operation_id(parser.specification, _operation_id)

    path_params = (
        {}
        if not api_info["path_params"]
        else gen_params_from_schema(api_info["path_params"], text, prev_api_response)
    )
    query_params = (
        {}
        if not api_info["query_params"]
        else gen_params_from_schema(api_info["query_params"], text, prev_api_response)
    )

    if api_info["body_schema"]:
        example = gen_ex_from_schema(api_info["body_schema"])
        body_schema = gen_body_from_schema(
            api_info["body_schema"], text, prev_api_response, example
        )
    else:
        body_schema = {}

    return {
        "endpoint": api_info["endpoint"],
        "method": api_info["method"],
        "path_params": path_params,
        "query_params": query_params,
        "body_schema": body_schema,
        "servers": api_info["servers"],
    }
