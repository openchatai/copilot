import asyncio
import os
from typing import Dict, Optional, List

from langchain.schema import BaseMessage

from custom_types.api_operation import ActionOperation_vs
from models.repository.action_repo import list_all_operation_ids_by_bot_id
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from opencopilot_types.workflow_type import WorkflowFlowType
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils import (
    run_workflow,
    create_workflow_from_operation_ids,
)
from routes.workflow.utils.api_retrievers import (
    get_relevant_apis_summaries,
    get_relevant_docs,
    get_relevant_flows,
)
from routes.workflow.utils.process_conversation_step import process_conversation_step
from utils.chat_models import CHAT_MODELS
from utils.db import Database
from utils.get_chat_model import get_chat_model
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


def validate_steps(steps: List[str], bot_id: str):
    try:
        operation_ids = list_all_operation_ids_by_bot_id(bot_id)

        if not operation_ids:
            logger.warn("No operation_ids found in the Swagger document.")
            return False

        if all(x in operation_ids for x in steps):
            return True
        else:
            logger.warn("Model has hallucinated, made up operation id", steps=steps, operationIds=operation_ids)
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
    apis: List[ActionOperation_vs] = []
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
            fl = validate_steps(step.ids, bot_id)

            if fl is False:
                return {"error": None, "response": step.bot_message}

            response = await handle_api_calls(
                ids=step.ids,
                app=app,
                bot_id=bot_id,
                headers=headers,
                session_id=session_id,
                text=text,
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
            prev_conversations=prev_conversations,
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


async def handle_api_calls(
        ids: List[str],
        text: str,
        headers: Dict[str, str],
        app: Optional[str],
        session_id: str,
        bot_id: str,
) -> ResponseDict:
    _workflow = create_workflow_from_operation_ids(ids, text)
    output = await run_workflow(
        _workflow,
        WorkflowData(text, headers, app),
        app,
        bot_id=bot_id,
    )

    return output


def handle_no_api_call(bot_message: str) -> ResponseDict:
    return {"response": bot_message, "error": ""}
