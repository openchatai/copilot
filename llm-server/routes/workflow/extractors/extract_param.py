import os
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from routes.workflow.extractors.extract_json import extract_json_payload
from utils.get_llm import get_llm

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def extractParamsFromSchema(param_schema: dict, extracted_features, prev_resp: str):
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
