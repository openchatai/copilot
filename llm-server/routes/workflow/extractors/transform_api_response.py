import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from routes.workflow.extractors.extract_json import extract_json_payload
from utils.get_llm import get_llm
from custom_types.t_json import JsonData
from typing import Optional

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def transform_api_response_from_schema(
    server_url: str, api_response: str
) -> Optional[JsonData]:
    _DEFAULT_TEMPLATE = """Given the following response from an api call```{api_response}``` extract the parts of information necessary for making furthur api calls to a backend server. Just return a json payload wrapped between three back ticks. use descriptive keys when returning the json"""

    PROMPT = PromptTemplate(
        input_variables=["prev_resp", "text", "param_schema"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(
        api_response=api_response,
    )

    chain = LLMChain(llm=llm, prompt=PROMPT, verbose=True)
    json_string = chain.run(
        {
            "api_response": api_response,
        }
    )

    response = extract_json_payload(json_string)
    response["url"] = server_url
    print(f"Extracted properties from api response: {response}")

    return response
