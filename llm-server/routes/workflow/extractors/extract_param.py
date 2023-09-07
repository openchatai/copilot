import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from routes.workflow.extractors.extract_json import extract_json_payload
from utils.get_llm import get_llm
from custom_types.t_json import JsonData
from typing import Optional

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def extractParamsFromSchema(
    param_schema: JsonData, extracted_features: str, prev_resp: str
) -> Optional[JsonData]:
    _DEFAULT_TEMPLATE = """User: You will be provided with the following essential components: responses from previous API calls, previously extracted features that may be required, and a schema specifying the expected format for query parameters, including both type and route parameters.
    
    Previous API Responses: ```{prev_resp}```.

    Previously Extracted Features: ```{extracted_features}```.

    The Parameter schema is defined as follows: ```{param_schema}```.

    Your response should consist of a json containing key-value pairs that adhere to the specified Parameter schema. Enclose the json within 3 backticks on both sides. \nAgent: """

    PROMPT = PromptTemplate(
        input_variables=["prev_resp", "extracted_features", "param_schema"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(
        prev_resp=prev_resp,
        extracted_features=extracted_features,
        param_schema=param_schema,
    )

    chain = LLMChain(llm=llm, prompt=PROMPT, verbose=True)
    json_string = chain.run(
        {
            "param_schema": param_schema,
            "extracted_features": extracted_features,
            "prev_resp": prev_resp,
        }
    )

    response = extract_json_payload(json_string)
    return response
