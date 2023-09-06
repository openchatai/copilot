from langchain.tools.json.tool import JsonSpec
import re, os, json
from dotenv import load_dotenv
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain import PromptTemplate

from routes.workflow.extractors.extract_json import extract_json_payload

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=openai_api_key)


def extractBodyFromSchema(api_operation: dict, extracted_features: str, prev_resp: str):
    body_schema = api_operation["requestBody"]["content"]["application/json"]["schema"]["properties"]
    # {'id': {'type': 'integer', 'format': 'int64', 'example': 10}, 'name': {'type': 'string', 'example': 'doggie'}, 'category': {'$ref': '#/components/schemas/Category'}, 'photoUrls': {'type': 'array', 'xml': {...}, 'items': {...}}, 'tags': {'type': 'array', 'xml': {...}, 'items': {...}}, 'status': {'type': 'string', 'description': 'pet status in the store', 'enum': [...]}}
    _DEFAULT_TEMPLATE = """You will receive the following essential components: responses from previous API calls, previously extracted features that may be necessary, and a schema for the JSON response I expect. Enclose the JSON payload with three backticks on both sides. If any required parameter is missing, kindly substitute it with a placeholder value.

    Previous API Responses: {prev_resp}.

    Previously Extracted Features: {extracted_features}.

    JSON Response Schema: {body_schema}.

    The API payload is as follows: """

    PROMPT = PromptTemplate(
        input_variables=["extracted_features", "body_schema", "prev_resp"], template=_DEFAULT_TEMPLATE
    )
    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True
    )
    json_string = chain.predict(extracted_features=extracted_features, body_schema=body_schema, prev_resp=prev_resp)

    response = extract_json_payload(json_string)
    # vector_store.add_texts([json_string])

    return response