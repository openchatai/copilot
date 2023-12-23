import asyncio
import os
from typing import Dict, Optional, List, cast

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage

from custom_types.response_dict import ResponseDict
from custom_types.run_workflow_input import ChatContext
from entities.flow_entity import FlowDTO
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from models.repository.flow_repo import get_flow_by_id
from routes.flow.utils import create_flow_from_operation_ids, run_flow
from routes.flow.utils.api_retrievers import (
    get_relevant_knowledgebase,
    get_relevant_actions,
    get_relevant_flows,
)
from routes.flow.utils.document_similarity_dto import (
    select_top_documents,
    DocumentSimilarityDTO,
)
from routes.flow.utils.process_conversation_step import get_next_response_type
from utils.db import NoSQLDatabase
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections

logger = CustomLogger(module_name=__name__)

db_instance = NoSQLDatabase()
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


def is_the_llm_predicted_operation_id_actually_true(
    predicted_operation_id: str,
    actionable_items: dict[str, list[DocumentSimilarityDTO]],
):
    """
    If it is indeed true, it will return the action as DocumentSimilarityDTO, otherwise return None
    Args:
        predicted_operation_id:
        actionable_items:

    Returns:

    """
    actions = actionable_items.get(VectorCollections.actions) or []

    for action in actions:
        if predicted_operation_id == action.document.metadata.get("operation_id"):
            return {VectorCollections.actions: [action]}
    return None


async def handle_request(
    text: str,
    session_id: str,
    base_prompt: str,
    bot_id: str,
    headers: Dict[str, str],
    app: Optional[str],
) -> ResponseDict:
    # Dict
    response: ResponseDict = {
        "error": "",
        "response": "Something went wrong, please try again!",
    }
    check_required_fields(base_prompt, text)

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
        top_documents=top_documents,
    )

    if next_step.actionable:
        # if the LLM given operationID is actually exist, then use it, otherwise fallback to the highest vector space document
        llm_predicted_operation_id = is_the_llm_predicted_operation_id_actually_true(
            next_step.operation_id, select_top_documents(actions)
        )
        if llm_predicted_operation_id:
            actionable_item = llm_predicted_operation_id
        else:
            actionable_item = select_top_documents(
                actions + flows, [VectorCollections.actions, VectorCollections.flows]
            )
        # now run it
        response = await run_actionable_item(
            bot_id=bot_id,
            actionable_item=actionable_item,
            app=app,
            headers=headers,
            text=text,
        )
        return response
    else:
        # it means that the user query is "informative" and can be answered using text only
        # get the top knowledgeable documents (if any)
        documents = select_top_documents(knowledgebase)
        response = run_informative_item(
            informative_item=documents,
            base_prompt=base_prompt,
            text=text,
            conversations_history=conversations_history,
        )
        return response


def check_required_fields(base_prompt: str, text: str) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


# @Todo: This can be improved, using dense and sparse matrix similarity or by using addition llm call
# ref: https://qdrant.tech/articles/sparse-vectors/?utm_source=linkedin&utm_medium=social&utm_campaign=sparse-vectors&utm_content=article
async def run_actionable_item(
    actionable_item: dict[str, List[DocumentSimilarityDTO]],
    text: str,
    headers: Dict[str, str],
    app: Optional[str],
    bot_id: str,
) -> ResponseDict:
    output: ResponseDict = {
        "error": "",
        "response": "Sorry, I can't help you with that action",
    }

    actions = actionable_item.get(VectorCollections.actions)
    flows = actionable_item.get(VectorCollections.flows)

    _flow = None
    if actionable_item.get(VectorCollections.actions) and actions is not None:
        action = actions[0]
        operation_id = cast(
            str, action.document.metadata.get("operation_id")
        )  # this variable now holds Qdrant vector document, which is the Action metadata

        _flow = create_flow_from_operation_ids(
            operation_ids=[operation_id], bot_id=bot_id
        )
    elif flows is not None:
        flow_with_relevance_score = flows[0]
        flow = (
            flow_with_relevance_score.document
        )  # this variable now holds Qdrant vector document, which is the flow metadata
        flow_id = cast(str, flow.metadata.get("flow_id"))
        flow_model = get_flow_by_id(flow_id)

        if flow_model:
            _flow = FlowDTO(
                id=flow_model.id,
                bot_id=bot_id,
                flow_id=flow_model.id,
                name=flow_model.name,
                description=flow_model.description,
                blocks=flow_model.payload,
                variables=[],
            )

    if _flow is not None:
        output = await run_flow(
            flow=_flow,
            chat_context=ChatContext(text, headers, app),
            app=app,
            bot_id=bot_id,
        )

    return output


def run_informative_item(
    informative_item: dict[str, List[DocumentSimilarityDTO]],
    base_prompt: str,
    text: str,
    conversations_history: List[BaseMessage],
) -> ResponseDict:
    # so we got all context, let's ask:

    context = []
    for vector_result in informative_item.get(VectorCollections.knowledgebase) or []:
        context.append(vector_result.document.metadata)

    messages: List[BaseMessage] = [SystemMessage(content=base_prompt)]

    if len(conversations_history) > 0:
        messages.extend(conversations_history)

    if len(context):
        messages.append(
            HumanMessage(
                content=f"I found some relevant context that might be helpful. Here is the context: ```{','.join(str(context))}```. "
            )
        )

    messages.append(
        HumanMessage(
            content="""Based on the information provided to you and the conversation history of this conversation, I want you to answer the questions that follow, make sure your answer is helpful
            and clear and use advisable tune (at the end you advise based on the given context)"""
        )
    )
    messages.append(
        HumanMessage(
            content="If you are unsure, or you think you can do a better job by asking clarification questions, then ask."
        )
    )

    messages.append(HumanMessage(content=text))

    content = cast(str, chat(messages=messages).content)

    return {"response": content, "error": None}
