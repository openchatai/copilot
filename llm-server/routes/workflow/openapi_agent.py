from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.requests import RequestsWrapper
from langchain.tools.json.tool import JsonSpec
from utils.get_llm import get_llm
import os
from typing import Dict, Any


def run_openapi_agent_from_json(
    spec_json: Dict[str, Any], prompt: str, prev_api_response: str
) -> str:
    json_spec = JsonSpec(dict_=spec_json, max_value_length=4000)

    headers = {"Authorization": f"Bearer {os.getenv('API_KEY')}"}
    openapi_requests_wrapper = RequestsWrapper(headers=headers)

    openapi_toolkit = OpenAPIToolkit.from_llm(
        llm=get_llm(), json_spec=json_spec, requests_wrapper=openapi_requests_wrapper
    )
    openapi_agent_executor = create_openapi_agent(
        llm=get_llm(), toolkit=openapi_toolkit
    )

    return openapi_agent_executor.run(prompt)
