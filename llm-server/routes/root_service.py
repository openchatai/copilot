import asyncio
import os
from typing import Dict, Optional, List

from langchain.schema import BaseMessage

from entities.flow_entity import FlowDTO
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
from routes.workflow.utils.process_conversation_step import get_next_response_type
from utils.db import Database
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections, UserMessageResponseType

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

chat = get_chat_model()


async def handle_request(
        text: str,
        session_id: str,
        base_prompt: str,
        bot_id: str,
        headers: Dict[str, str],
        app: Optional[str],
) -> ResponseDict:
    check_required_fields(base_prompt, text)
    knowledgebase: List[DocumentSimilarityDTO] = []
    actions: List[DocumentSimilarityDTO] = []
    flows: List[DocumentSimilarityDTO] = []
    conversations_history: List[BaseMessage] = []
    try:
        tasks = [
            get_relevant_knowledgebase(text, bot_id),
            get_relevant_actions(text, bot_id),
            get_relevant_flows(text, bot_id),
            get_chat_message_as_llm_conversation(session_id),
        ]

        results = await asyncio.gather(*tasks)
        knowledgebase, actions, flows, conversations_history = results
        top_documents = select_top_documents(actions + flows + knowledgebase)

        next_step = get_next_response_type(
            user_message=text,
            session_id=session_id,
            chat_history=conversations_history,
            top_documents=top_documents
        )

        if next_step.get('type') is UserMessageResponseType.actionable:
            # get the single highest actionable item (could be an action or a flow) - hope we are lucky, and we can get the right one XD
            actionable_item = select_top_documents(actions + flows,
                                                   [VectorCollections.actions, VectorCollections.actions])

            # now run it
            response = await run_actionable_item(
                bot_id=bot_id,
                actionable_item=actionable_item,
                base_prompt=base_prompt,
                app=app,
                headers=headers,
                text=text,
            )
            return response
            pass
        else:
            # get the highest similarly knowledgeable item
            # put it into the context
            # ask the llm
            pass

        return None


def check_required_fields(base_prompt: str, text: str) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


async def run_actionable_item(
        actionable_item: DocumentSimilarityDTO,
        base_prompt: str,
        ids: List[str],
        text: str,
        headers: Dict[str, str],
        app: Optional[str],
        bot_id: str,
) -> ResponseDict:

    if actionable_item.type is VectorCollections.actions:
        # we can't run stand-alone actions, so build a flow with single action and run it
        action = None
        flow = None
        pass
    else:
        # then it's a flow already, so just fetch the DTO and run it.
        flow = None
        pass

    _flow = create_dynamic_flow_from_operation_ids(operation_ids=ids, bot_id=bot_id)
    output = await run_flow(
        flow=_flow,
        chat_context=ChatContext(text, headers, app),
        app=app,
        bot_id=bot_id,
    )


    # now take the output, put it into a chat message with the base prompt and ask the llm to present it
    return output

