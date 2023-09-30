import requests, traceback, logging
from langchain.chains.openai_functions import create_structured_output_chain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate

from langchain.utilities.openapi import OpenAPISpec
from utils.base import try_to_match_and_call_api_endpoint
from models.models import AiResponseFormat
from prompts.base import api_base_prompt, non_api_base_prompt
from routes.workflow.workflow_service import run_workflow
from routes.workflow.typings.run_workflow_input import WorkflowData
from utils.detect_multiple_intents import hasSingleIntent, hasMultipleIntents
import os
from dotenv import load_dotenv
from typing import Dict, Any, cast
from utils.db import Database
import json

db_instance = Database()
mongo = db_instance.get_db()


load_dotenv()
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")


# Define constants for error messages
BASE_PROMPT_REQUIRED = "base_prompt is required"
TEXT_REQUIRED = "text is required"
SWAGGER_URL_REQUIRED = "swagger_url is required"
FAILED_TO_FETCH_SWAGGER_CONTENT = "Failed to fetch Swagger content"
FILE_NOT_FOUND = "File not found"
FAILED_TO_CALL_API_ENDPOINT = "Failed to call or map API endpoint"


def fetch_swagger_text(swagger_url: str) -> str:
    if swagger_url.startswith("https://"):
        response = requests.get(swagger_url)
        if response.status_code == 200:
            return response.text
        raise Exception(FAILED_TO_FETCH_SWAGGER_CONTENT)
    try:
        with open(shared_folder + swagger_url, "r") as file:
            return file.read()
    except FileNotFoundError:
        raise Exception(FILE_NOT_FOUND)


def handle_request(data: Dict[str, Any]) -> Any:
    text: str = cast(str, data.get("text"))
    swagger_url = cast(str, data.get("swagger_url", ""))
    base_prompt = data.get("base_prompt", "")
    headers = data.get("headers", {})
    server_base_url = cast(str, data.get("server_base_url", ""))

    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
        ("swagger_url", SWAGGER_URL_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)

    swagger_doc = mongo.swagger_files.find_one(
        {"meta.swagger_url": swagger_url}, {"meta": 0, "_id": 0}
    ) or json.loads(fetch_swagger_text(swagger_url))

    try:
        if not hasSingleIntent(swagger_doc, text):
            return run_workflow(
                WorkflowData(text, headers, server_base_url, swagger_url), swagger_doc
            )
    except Exception as e:
        print(e)

    swagger_spec = OpenAPISpec.from_text(fetch_swagger_text(swagger_url))

    try:
        json_output = try_to_match_and_call_api_endpoint(swagger_spec, text, headers)
    except Exception as e:
        logging.error(f"{FAILED_TO_CALL_API_ENDPOINT}: {str(e)}")
        logging.error("Exception traceback:\n" + traceback.format_exc())
        json_output = None

    llm = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0)

    prompt_msgs = (
        non_api_base_prompt(base_prompt, text)
        if json_output is None
        else api_base_prompt(base_prompt, text, json_output)
    )
    prompt = ChatPromptTemplate(messages=prompt_msgs)
    chain = create_structured_output_chain(AiResponseFormat, llm, prompt, verbose=False)
    return chain.run(question=text).dict()
