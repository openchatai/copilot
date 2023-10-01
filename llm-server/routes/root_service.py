import requests, traceback, logging
from langchain.chains.openai_functions import create_structured_output_chain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from utils.vector_db.add_workflow import add_workflow_data_to_qdrant
from langchain.utilities.openapi import OpenAPISpec
from utils.base import try_to_match_and_call_api_endpoint
from models.models import AiResponseFormat
from prompts.base import api_base_prompt, non_api_base_prompt
from routes.workflow.workflow_service import (
    check_workflow_in_vector_store,
    run_workflow,
    run_workflow_final,
)
from routes.workflow.typings.run_workflow_input import WorkflowData
from utils.custom_api_planner import get_api_plan
import os
from dotenv import load_dotenv
from typing import Dict, Any, cast, List
from utils.db import Database
import json, yaml

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
    )

    if not swagger_doc:
        # If the document is not found in MongoDB, fetch it from the URL
        swagger_text = fetch_swagger_text(swagger_url)

        # Check if the fetched content is in YAML format
        try:
            swagger_doc = yaml.safe_load(swagger_text)
        except yaml.YAMLError:
            # If it's not valid YAML, assume it's JSON
            swagger_doc = json.loads(swagger_text)

    try:
        plan = get_api_plan(swagger_doc, text)

        if len(plan.ids) > 1:
            workflow_data = WorkflowData(text, headers, server_base_url, swagger_url)
            # generate a workflow, if it fails remove it immediately. Furthur api calls can use the workflow if it was defined and it worked
            workflow = check_workflow_in_vector_store(workflow_data)

            # if workflow is not defined, create one from planner
            if workflow is None:
                workflow = create_workflow_from_operation_ids(plan.ids, swagger_doc)
                # inserted_id = mongo.workflows.insert_one(new_workflow).inserted_id
                # add_workflow_data_to_qdrant(inserted_id, workflow_data, swagger_url)

            run_workflow_final(workflow, swagger_doc, workflow_data)

        elif len(plan.ids) == 1:
            raise Exception("Use try and match to complete this")

        elif len(plan.ids) == 0:
            return {"response": plan.bot_message}

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


def get_operation_by_id(swagger_spec, op_id_key: str):
    operation_lookup = {}

    for path in swagger_spec["paths"]:
        for method in swagger_spec["paths"][path]:
            operation = swagger_spec["paths"][path][method]
            operation_id = operation["operationId"]
            operation_lookup[operation_id] = {
                "name": operation.get("name"),
                "description": operation.get("description"),
            }

    return operation_lookup[op_id_key]


def create_workflow_from_operation_ids(op_ids: List[str], SWAGGER_SPEC: Any) -> Any:
    flows = []

    for op_id in op_ids:
        operation = get_operation_by_id(SWAGGER_SPEC, op_id)
        step = {
            "stepId": str(op_ids.index(op_id)),
            "operation": "call",
            "open_api_operation_id": op_id,
        }
        flow = {
            "name": operation["name"],
            "description": operation["description"],
            "requires_confirmation": False,
            "steps": [step],
            "on_success": [{"handler": "plotOutcomeJsFunction"}],
            "on_failure": [{"handler": "plotOutcomeJsFunction"}],
        }
        flows.append(flow)

    workflow = {
        "opencopilot": "0.1",
        "info": {"title": "<user input as function parameter>", "version": "1.0.0"},
        "flows": flows,
    }

    return workflow
