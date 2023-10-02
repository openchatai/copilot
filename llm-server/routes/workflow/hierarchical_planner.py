from typing import Dict, Any

from langchain.agents.agent_toolkits.openapi.spec import reduce_openapi_spec
from langchain.requests import RequestsWrapper
from langchain.llms.openai import OpenAI

# from langchain.agents.agent_toolkits.openapi import planner # This is a custom planner, because of issue in langchains current implementation of planner, we will track this
from api_caller import planner
import json


import os

PLAN_AND_EXECUTE_MODEL = os.getenv("PLAN_AND_EXECUTE_MODEL", "gpt-4")


def create_and_run_openapi_agent(
    swagger_json: Any, user_query: str, headers: Dict[str, str] = {}
) -> Any:
    # Load OpenAPI spec
    # raw_spec = json.loads(swagger_json)
    spec = reduce_openapi_spec(swagger_json)

    # Create RequestsWrapper with auth
    requests_wrapper: RequestsWrapper = RequestsWrapper(headers=headers)

    print(
        f"Using {PLAN_AND_EXECUTE_MODEL} for plan and execute agent, you can change it by setting PLAN_AND_EXECUTE_MODEL variable"
    )
    # Create OpenAPI agent
    llm: OpenAI = OpenAI(temperature=0.0)
    agent = planner.create_openapi_agent(spec, requests_wrapper, llm)

    # Run agent on user query
    response = agent.run(user_query)
    return response
