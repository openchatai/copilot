import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from utils.get_llm import get_llm

from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload
from custom_types.t_json import JsonData

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def extractBodyFromSchema(
    body_schema: JsonData,
    extracted_features: str,
    prev_api_response: str,
) -> Any:
    _DEFAULT_TEMPLATE = """You will receive the following essential components: responses from previous API calls, previously extracted features that may be necessary, and a schema for the JSON response I expect. Enclose the JSON payload with three backticks on both sides. If any required parameter is missing, kindly substitute it with a placeholder value.

    Previous API Responses: {prev_api_response}.

    Previously Extracted Features: {extracted_features}.

    JSON Response Schema: {body_schema}.

    The API payload is as follows: """

    PROMPT = PromptTemplate(
        input_variables=["extracted_features", "body_schema", "prev_api_response"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(
        prev_api_response=prev_api_response,
        body_schema=body_schema,
        extracted_features=extracted_features,
    )

    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True,
    )
    json_string = chain.run(
        {
            "extracted_features": extracted_features,
            "body_schema": body_schema,
            "prev_api_response": prev_api_response,
        }
    )

    response = extract_json_payload(json_string)

    return response
