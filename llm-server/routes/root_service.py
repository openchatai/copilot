import asyncio
import os
from typing import Dict, Optional, List

from langchain.schema import BaseMessage

from models.repository.action_repo import list_all_operation_ids_by_bot_id
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import ChatContext
from routes.workflow.utils import (
    run_flow,
    create_dynamic_flow_from_operation_ids,
)
from routes.workflow.utils.api_retrievers import (
    get_relevant_actions,
    get_relevant_knowledgebase,
    get_relevant_flows,
)
from routes.workflow.utils.document_similarity_dto import (
    select_top_documents,
    DocumentSimilarityDTO,
)
from routes.workflow.utils.process_conversation_step import process_conversation_step
from utils.chat_models import CHAT_MODELS
from utils.db import Database
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections

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
            logger.warn(
                "Model has hallucinated, made up operation id",
                steps=steps,
                operationIds=operation_ids,
            )
            return False

    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
        return False


async def handle_request(
    text: str,
    session_id: str,
    base_prompt: str,
    bot_id: str,
    headers: Dict[str, str],
    app: Optional[str],
) -> ResponseDict:
    log_user_request(text)
    check_required_fields(base_prompt, text)
    knowledgebase: List[DocumentSimilarityDTO] = []
    actions: List[DocumentSimilarityDTO] = []
    flows: List[DocumentSimilarityDTO] = []
    prev_conversations: List[BaseMessage] = []
    try:
        tasks = [
            get_relevant_knowledgebase(text, bot_id),
            get_relevant_actions(text, bot_id),
            get_relevant_flows(text, bot_id),
            get_chat_message_as_llm_conversation(session_id),
        ]

        results = await asyncio.gather(*tasks)
        knowledgebase, actions, flows, prev_conversations = results
        top_documents = select_top_documents(actions + flows + knowledgebase)

        logger.info("Got top documents by score", top_documents=top_documents)

        """
        also provide a list of flows here itself, the llm should be able to figure out if a flow needs to be run
        """
        step = process_conversation_step(
            user_message=text,
            knowledgebase=top_documents[VectorCollections.knowledgebase],
            session_id=session_id,
            actions=top_documents[VectorCollections.knowledgebase],
            prev_conversations=prev_conversations,
            flows=top_documents[VectorCollections.flows],
            base_prompt=base_prompt,
        )

        if step.missing_information is not None and len(step.missing_information) >= 10:
            return {"error": None, "response": step.missing_information}

        if len(step.ids) > 0:
            if validate_steps(step.ids, bot_id) is False:
                return {"error": None, "response": step.bot_message}

            response = await create_and_run_dynamic_flow(
                ids=step.ids,
                app=app,
                bot_id=bot_id,
                headers=headers,
                text=text,
            )

            logger.info(
                "chatbot response",
                response=response,
                method="handle_request",
                apis=actions,
                prev_conversations=prev_conversations,
                context=knowledgebase,
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


def check_required_fields(base_prompt: str, text: str) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


async def create_and_run_dynamic_flow(
    ids: List[str],
    text: str,
    headers: Dict[str, str],
    app: Optional[str],
    bot_id: str,
) -> ResponseDict:
    _flow = create_dynamic_flow_from_operation_ids(operation_ids=ids, bot_id=bot_id)
    output = await run_flow(
        flow=_flow,
        chat_context=ChatContext(text, headers, app),
        app=app,
        bot_id=bot_id,
    )

    return output


def handle_no_api_call(bot_message: str) -> ResponseDict:
    return {"response": bot_message, "error": ""}
