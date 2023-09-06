import os, json
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain import PromptTemplate


from routes.workflow.load_openapi_spec import load_openapi_spec
from routes.workflow.extractors.extract_json import extract_json_payload

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=openai_api_key)

def extractParamsFromSchema(param_schema: dict, extracted_features, prev_resp: str):
    _DEFAULT_TEMPLATE = """You will receive the following essential components: responses from previous API calls, previously extracted features that may be necessary, and a schema for the JSON response I expect. Enclose the JSON payload with three backticks on both sides. If any required parameter is missing, kindly substitute it with a placeholder value.

    Previous API Responses: {prev_resp}.

    Previously Extracted Features: {extracted_features}.

    JSON Response Schema: {param_schema}.

    The API payload is as follows: """

    PROMPT = PromptTemplate(
        input_variables=["prev_resp", "param_schema", "input"], template=_DEFAULT_TEMPLATE
    )
    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        verbose=True
    )
    json_string = chain.predict( param_schema=param_schema, extracted_features=extracted_features, prev_resp=prev_resp)

    response = extract_json_payload(json_string)
    return response
