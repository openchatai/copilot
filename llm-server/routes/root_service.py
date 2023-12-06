import os
import json
from typing import Dict, Any, Optional, List
from langchain.schema import BaseMessage
from custom_types.api_operation import ApiOperation_vs
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils import (
    run_workflow,
    create_workflow_from_operation_ids,
)
from bson import ObjectId
from routes.workflow.utils.api_retrievers import (
    get_relevant_apis_summaries,
    get_relevant_docs,
    get_relevant_flows,
)
from routes.workflow.utils.process_conversation_step import process_conversation_step

from utils.chat_models import CHAT_MODELS
from utils.db import Database
from utils.get_chat_model import get_chat_model
from prance import ResolvingParser
from langchain.docstore.document import Document
from werkzeug.datastructures import Headers
import asyncio
from opencopilot_types.workflow_type import WorkflowFlowType


from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)

db_instance = Database()
mongo = db_instance.get_db()

shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")

# Define constants for error messages
BASE_PROMPT_REQUIRED = "base_prompt is required"
TEXT_REQUIRED = "text is required"
SWAGGER_URL_REQUIRED = "swagger_url is required"
FAILED_TO_FETCH_SWAGGER_CONTENT = "Failed to fetch Swagger content"
FILE_NOT_FOUND = "File not found"
FAILED_TO_CALL_API_ENDPOINT = "Failed to call or map API endpoint"

chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)

def validate_steps(steps: List[str], swagger_doc: ResolvingParser):
    try:
        paths = swagger_doc.specification.get("paths", {})
        operationIds: List[str] = []

        for path in paths:
            operations = paths[path]
            for method in operations:
                operation = operations[method]
                operationId = operation.get("operationId")
                if operationId:
                    operationIds.append(operationId)

        if not operationIds:
            logger.warn("No operationIds found in the Swagger document.")
            return False

        if all(x in operationIds for x in steps):
            return True
        else:
            logger.warn("Model has hallucinated, made up operation id", steps=steps, operationIds=operationIds)
            return False

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return False



async def handle_request(
    text: str,
    swagger_url: str,
    session_id: str,
    base_prompt: str,
    bot_id: str,
    headers: Dict[str, str],
    server_base_url: str,
    app: Optional[str],
) -> ResponseDict:
    log_user_request(text)
    check_required_fields(base_prompt, text, swagger_url)
    context: str = ""
    apis: List[ApiOperation_vs] = []
    flows: List[WorkflowFlowType] = []
    prev_conversations: List[BaseMessage] = []
    try:
        tasks = [
            get_relevant_docs(text, bot_id),
            get_relevant_apis_summaries(text, bot_id),
            get_relevant_flows(text, bot_id),
            get_chat_message_as_llm_conversation(session_id),
        ]

        results = await asyncio.gather(*tasks)
        context, apis, flows, prev_conversations = results
        # also provide a list of workflows here itself, the llm should be able to figure out if a workflow needs to be run
        step = process_conversation_step(
            user_requirement=text,
            context=context,
            session_id=session_id,
            app=app,
            api_summaries=apis,
            prev_conversations=prev_conversations,
            flows=flows,
            bot_id=bot_id,
            base_prompt=base_prompt
        )
        
        if step.missing_information is not None and len(step.missing_information) >= 10:
            return {
                "error": None,
                "response": step.missing_information
            }

        if len(step.ids) > 0:
            swagger_doc = get_swagger_doc(swagger_url)
            fl = validate_steps(step.ids, swagger_doc)
            
            if fl is False:
                return {"error": None, "response": step.bot_message}
            
            response = await handle_api_calls(
                ids=step.ids,
                swagger_doc=swagger_doc,
                app=app,
                bot_id=bot_id,
                headers=headers,
                server_base_url=server_base_url,
                session_id=session_id,
                text=text,
                swagger_url=swagger_url,
            )

            logger.info(
                "chatbot response",
                response=response,
                method="handle_request",
                apis=apis,
                prev_conversations=prev_conversations,
                context=context,
                flows=flows,
            )
            return response
        else:
            return {"error": None, "response": step.bot_message}
    except Exception as e:
        logger.error(
            "chatbot response",
            error=str(e),
            method="handle_request",
            apis=apis,
            prev_conversations=prev_conversations,
            context=context,
            flows=flows,
        )

        return {"response": str(e), "error": "An error occured in handle request"}


def log_user_request(text: str) -> None:
    logger.info(
        "[OpenCopilot] Got the following user request: {}".format(text),
        incident="log_user_request",
        method="log_user_request",
    )


def check_required_fields(
    base_prompt: str, text: str, swagger_url: Optional[str]
) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
        ("swagger_url", SWAGGER_URL_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


def get_swagger_doc(swagger_url: str) -> ResolvingParser:
    logger.info(f"Swagger url: {swagger_url}")
    swagger_doc: Optional[Dict[str, Any]] = mongo.swagger_files.find_one(
        {"meta.swagger_url": swagger_url}, {"meta": 0, "_id": 0}
    )

    if swagger_url.startswith("http:") or swagger_url.startswith("https:"):
        return ResolvingParser(url=swagger_url)
    elif swagger_url.endswith(".json") or swagger_url.endswith(".yaml"):
        return ResolvingParser(url=shared_folder + swagger_url)
    else:
        return ResolvingParser(spec_string=swagger_doc)


def handle_existing_workflow(
    document: Document,  # lagnchaing
    text: str,
    headers: Headers,
    server_base_url: str,
    swagger_url: Optional[str],
    app: Optional[str],
    swagger_doc: ResolvingParser,
    session_id: str,
    bot_id: str,
) -> ResponseDict:
    # use user defined workflows if exists, if not use auto_gen_workflow
    _workflow = mongo.workflows.find_one(
        {"_id": ObjectId(document.metadata["workflow_id"])}
    )

    if _workflow is None:
        _workflow = mongo.auto_gen_workflows.find_one(
            {"_id": ObjectId(document.metadata["workflow_id"])}
        )

    output = run_workflow(
        _workflow,
        swagger_doc,
        WorkflowData(text, headers, server_base_url, swagger_url, app),
        app,
        bot_id=bot_id,
    )

    return output


async def handle_api_calls(
    ids: List[str],
    swagger_doc: ResolvingParser,
    text: str,
    headers: Dict[str, str],
    server_base_url: str,
    swagger_url: Optional[str],
    app: Optional[str],
    session_id: str,
    bot_id: str,
) -> ResponseDict:
    _workflow = create_workflow_from_operation_ids(ids, swagger_doc, text)
    output = await run_workflow(
        _workflow,
        swagger_doc,
        WorkflowData(text, headers, server_base_url, swagger_url, app),
        app,
        bot_id=bot_id,
    )

    _workflow["swagger_url"] = swagger_url
    # m_workflow = mongo.auto_gen_workflows.insert_one(_workflow)
    # add_workflow_data_to_qdrant(m_workflow.inserted_id, _workflow, swagger_url)

    return output


def handle_no_api_call(bot_message: str) -> ResponseDict:
    return {"response": bot_message, "error": ""}
