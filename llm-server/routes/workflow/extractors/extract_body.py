import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from utils.get_llm import get_llm

from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload
from custom_types.t_json import JsonData

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def gen_body_from_schema(
    body_schema: str, text: str, prev_api_response: str, example: str
) -> Any:
    _DEFAULT_TEMPLATE = """To enable a substantially intelligent language model to execute a series of APIs sequentially, the following essential details are necessary to gather information needed for the next API call:
    1. Initial input when starting the flow: `{text}`
    2. Previous API responses: `{prev_api_response}`
    3. A JSON response schema that defines the expected format: `{body_schema}`

    Try to adhere to this sample api payload as much as possible: ```{example}```
    The JSON payload, enclosed within triple backticks on both sides, strictly conforming to the specified "type/format" as outlined in the schema is as follows:  
    """

    PROMPT = PromptTemplate(
        input_variables=[
            "text",
            "body_schema",
            "prev_api_response",
            "example",
        ],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(
        prev_api_response=prev_api_response,
        body_schema=body_schema,
        text=text,
        example=example,
    )

    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True,
    )
    json_string = chain.run(
        {
            "text": text,
            "body_schema": body_schema,
            "prev_api_response": prev_api_response,
            "example": example,
        }
    )

    response = extract_json_payload(json_string)

    return response
