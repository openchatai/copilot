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


def handle_request(data: Dict[str, Any]) -> Any:
    text = data.get("text")
    swagger_url = cast(str, data.get("swagger_url"))
    base_prompt = data.get("base_prompt")
    headers = data.get("headers", {})
    server_base_url = cast(str, data.get("server_base_url"))

    if not base_prompt:
        raise Exception("base_prompt is required")

    if not text:
        raise Exception("text is required")

    if not swagger_url:
        raise Exception("swagger_url is required")

    # Check if swagger file exists in MongoDB
    swagger_doc = mongo.swagger_files.find_one({"_id": swagger_url})

    if swagger_doc:
        swagger_doc["_id"] = str(swagger_doc["_id"])
        swagger_text = swagger_doc
    else:
        if swagger_url.startswith("https://"):
            pass
        else:
            swagger_url = shared_folder + swagger_url

        print(f"swagger_url::{swagger_url}")

        if swagger_url.startswith("https://"):
            response = requests.get(swagger_url)
            if response.status_code == 200:
                swagger_text = response.text
            else:
                raise Exception("Failed to fetch Swagger content")
        else:
            try:
                with open(swagger_url, "r") as file:
                    swagger_text = file.read()
            except FileNotFoundError:
                raise Exception("File not found")

        swagger_json = json.loads(swagger_text)
        swagger_json["bot_id"] = swagger_url.replace(shared_folder, "")
        mongo.swagger_files.update_one(
            {"bot_id": swagger_json["bot_id"]}, {"$set": swagger_json}, True
        )

    try:
        if hasMultipleIntents(text):
            return run_workflow(
                WorkflowData(text, swagger_text, headers, server_base_url)
            )
    except Exception as e:
        print(e)

    swagger_spec = OpenAPISpec.from_text(swagger_text)

    try:
        json_output = try_to_match_and_call_api_endpoint(swagger_spec, text, headers)
    except Exception as e:
        logging.error(f"Failed to call or map API endpoint: {str(e)}")
        logging.error("Exception traceback:\n" + traceback.format_exc())
        json_output = None

    llm = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0)

    if json_output is None:
        prompt_msgs = non_api_base_prompt(base_prompt, text)
    else:
        prompt_msgs = api_base_prompt(base_prompt, text, json_output)

    prompt = ChatPromptTemplate(messages=prompt_msgs)
    chain = create_structured_output_chain(AiResponseFormat, llm, prompt, verbose=False)
    return chain.run(question=text).dict()
