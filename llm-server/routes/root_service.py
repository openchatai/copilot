import json
import os
from typing import Dict, Any, cast

import logging
import requests
import traceback
from dotenv import load_dotenv
from langchain.chains.openai_functions import create_structured_output_chain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.utilities.openapi import OpenAPISpec
from models.models import AiResponseFormat
from prompts.base import api_base_prompt, non_api_base_prompt
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.workflow_service import run_workflow
from utils.detect_multiple_intents import hasSingleIntent
import os
from dotenv import load_dotenv
from typing import Dict, Any, cast
from utils.db import Database
from utils.detect_multiple_intents import hasSingleIntent
import json
import yaml
from yaml.parser import ParserError
from api_caller.base import try_to_match_and_call_api_endpoint

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
            try:
                # Try parsing the content as JSON
                json_content = json.loads(response.text)
                return json.dumps(json_content, indent=2)
            except json.JSONDecodeError:
                try:
                    # Try parsing the content as YAML
                    yaml_content = yaml.safe_load(response.text)
                    if isinstance(yaml_content, dict):
                        return json.dumps(yaml_content, indent=2)
                    else:
                        raise Exception("Invalid YAML content")
                except ParserError:
                    raise Exception("Failed to parse content as JSON or YAML")

        raise Exception("Failed to fetch Swagger content")

    try:
        with open(shared_folder + swagger_url, "r") as file:
            content = file.read()
            try:
                # Try parsing the content as JSON
                json_content = json.loads(content)
                return json.dumps(json_content, indent=2)
            except json.JSONDecodeError:
                try:
                    # Try parsing the content as YAML
                    yaml_content = yaml.safe_load(content)
                    if isinstance(yaml_content, dict):
                        return json.dumps(yaml_content, indent=2)
                    else:
                        raise Exception("Invalid YAML content")
                except ParserError:
                    raise Exception("Failed to parse content as JSON or YAML")
    except FileNotFoundError:
        raise Exception("File not found")


def handle_request(data: Dict[str, Any]) -> Any:
    text: str = cast(str, data.get("text"))
    swagger_url = cast(str, data.get("swagger_url", ""))
    base_prompt = data.get("base_prompt", "")
    headers = data.get("headers", {})
    server_base_url = cast(str, data.get("server_base_url", ""))

    logging.info("[OpenCopilot] Got the following user request: {}".format(text))

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
        logging.info(
            "[OpenCopilot] Trying to figure out if the user request require 1) APIs calls 2) If yes how many "
            "of them"
        )
        bot_response = hasSingleIntent(swagger_doc, text)
        if len(bot_response.ids) > 1:
            logging.info(
                "[OpenCopilot] Apparently, the user request require calling more than single API endpoint "
                "to get the job done"
            )
            return run_workflow(
                WorkflowData(text, headers, server_base_url, swagger_url), swagger_doc
            )
        elif len(bot_response.ids) == 0:
            logging.info("[OpenCopilot] The user request doesnot require an api call")
            return {"response": bot_response.bot_message}

        else:
            logging.info(
                "[OpenCopilot] The user request can be handled in single API call"
            )

    except Exception as e:
        logging.info(
            "[OpenCopilot] Something went wrong when try to get how many calls is required"
        )

    logging.info(
        "[OpenCopilot] The user request will be handled by single API call or otherwise a normal text response"
    )

    swagger_spec = OpenAPISpec.from_text(fetch_swagger_text(swagger_url))

    try:
        logging.info(
            "[OpenCopilot] Trying to match the request to a single API endpoint"
        )
        json_output = try_to_match_and_call_api_endpoint(swagger_spec, text, headers)

        formatted_response = json.dumps(
            json_output, indent=4
        )  # Indent the JSON with 4 spaces
        logging.info(
            "[OpenCopilot] We were able to match and call the API endpoint, the response was: {}".format(
                formatted_response
            )
        )
    except Exception as e:
        logging.info(
            "[OpenCopilot] Failed to call the single API endpoint - so we will fallback to normal text "
            "response"
        )
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
