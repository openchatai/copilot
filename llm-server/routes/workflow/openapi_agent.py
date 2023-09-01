import yaml
from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.llms.openai import OpenAI
from langchain.requests import RequestsWrapper
from langchain.tools.json.tool import JsonSpec
import os

def run_openapi_agent_from_json(spec_json: dict, prompt: str, prev_api_response) -> None:
    json_spec = JsonSpec(dict_=spec_json, max_value_length=4000)

    headers = {"Authorization": f"Bearer {os.getenv('API_KEY')}"}
    openapi_requests_wrapper = RequestsWrapper(headers=headers)

    openapi_toolkit = OpenAPIToolkit.from_llm(
        OpenAI(temperature=0), json_spec, openapi_requests_wrapper, verbose=True
    )
    openapi_agent_executor = create_openapi_agent(
        llm=OpenAI(temperature=0), toolkit=openapi_toolkit, verbose=True
    )

    openapi_agent_executor.run(prompt)

# Example usage
# run_openapi_agent("openai_openapi.yaml", "Make a post request to openai /completions. The prompt should be 'tell me a joke.'")


# ---
# Next task is to chain the apis, such that output of last api can be used as the input to next api call. The llm should be able to parse
# necessary information from last api and pass it to the next api call if required. We will need openapi function to get the output
# in structured manner to be passed to next api