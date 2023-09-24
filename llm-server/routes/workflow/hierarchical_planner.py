from typing import Dict, Any

from langchain.agents.agent_toolkits.openapi.spec import reduce_openapi_spec
from langchain.requests import RequestsWrapper
from langchain.llms.openai import OpenAI
from langchain.agents.agent_toolkits.openapi import planner
from routes.workflow.load_openapi_spec import load_openapi_spec


def create_and_run_openapi_agent(
    spec_path: str, user_query: str, headers: Dict[str, str] = {}
) -> Any:
    # Load OpenAPI spec
    raw_spec = load_openapi_spec(spec_path)
    spec = reduce_openapi_spec(raw_spec)

    # Create RequestsWrapper with auth
    requests_wrapper: RequestsWrapper = RequestsWrapper(headers=headers)

    # Create OpenAPI agent
    llm: OpenAI = OpenAI(model_name="gpt-4", temperature=0.0)
    agent = planner.create_openapi_agent(spec, requests_wrapper, llm)

    # Run agent on user query
    response = agent.run(user_query)
    return response
