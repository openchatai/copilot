import asyncio
import os
from typing import Dict, Optional, List, cast

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage

from custom_types.bot_response import BotResponse
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


async def handle_user_message(
        text: str,
        session_id: str,
        base_prompt: str,
        bot_id: str,
        headers: Dict[str, str],
        app: Optional[str],
) -> BotResponse:
    """
    Handle a user's message by determining the appropriate response.

    Parameters:
    text: The user's message.
    session_id: The session identifier.
    base_prompt: The base prompt for responses.
    bot_id: Identifier for the bot.
    headers: Headers for the HTTP request.
    app: Optional application identifier.

    Returns:
    BotResponse: The bot's response.
    """

    check_required_fields(base_prompt, text)

    knowledgebase, actions, flows, conversations_history = await gather_message_data(
        text, session_id, bot_id
    )

    top_documents = select_top_documents(actions + flows + knowledgebase)
    next_step = determine_next_step(text, session_id, conversations_history, top_documents)

    if next_step.actionable:
        actionable_item = determine_actionable_item(next_step.operation_id, actions, flows)
        return await run_actionable_item(bot_id=bot_id, actionable_item=actionable_item, app=app, headers=headers,
                                         text=text)

    documents = select_top_documents(knowledgebase)
    return run_informative_item(informative_item=documents, base_prompt=base_prompt, text=text,
                                conversations_history=conversations_history)


async def gather_message_data(text, session_id, bot_id):
    """
    Gather data related to the message from various sources.

    Parameters:
    text: The user's message.
    session_id: The session identifier.
    bot_id: Identifier for the bot.

    Returns:
    Tuple containing knowledgebase, actions, flows, and conversation history.
    """

    tasks = [
        get_relevant_knowledgebase(text, bot_id),
        get_relevant_actions(text, bot_id),
        get_relevant_flows(text, bot_id),
        get_chat_message_as_llm_conversation(session_id),
    ]

    return await asyncio.gather(*tasks)


def determine_next_step(text, session_id, conversations_history, top_documents):
    """
    Determine the next step based on the user's message and available documents.

    Parameters:
    text: The user's message.
    session_id: The session identifier.
    conversations_history: History of the conversation.
    top_documents: Top documents selected.

    Returns:
    The next step to take (actionable or informative).
    """
    return get_next_response_type(
        user_message=text,
        session_id=session_id,
        chat_history=conversations_history,
        top_documents=top_documents,
    )


def determine_actionable_item(predicted_operation_id, actions, flows):
    """
    Determine the actionable item based on predicted operation ID and available actions and flows.

    Parameters:
    predicted_operation_id: The operation ID predicted by the LLM.
    actions: Available actions.
    flows: Available flows.

    Returns:
    The actionable item to be executed.
    """
    if is_the_llm_predicted_operation_id_actually_true(predicted_operation_id, select_top_documents(actions)):
        return predicted_operation_id
    else:
        return select_top_documents(actions + flows, [VectorCollections.actions, VectorCollections.flows])


def check_required_fields(base_prompt: str, text: str) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


async def run_actionable_item(
        actionable_item: dict[str, List[DocumentSimilarityDTO]],
        text: str,
        headers: Dict[str, str],
        app: Optional[str],
        bot_id: str,
) -> BotResponse:
    """
    Process the actionable item and execute the appropriate flow.

    Parameters:
    actionable_item: dict containing actions and flows.
    text: Text input from the user.
    headers: Headers for the HTTP request.
    app: Optional application identifier.
    bot_id: Identifier for the bot.

    Returns:
    BotResponse: The response from the executed bot flow.
    """

    actions = actionable_item.get(VectorCollections.actions)
    flows = actionable_item.get(VectorCollections.flows)

    flow_to_run = determine_flow_to_run(actions, flows, bot_id)

    if flow_to_run is not None:
        output = await execute_flow(flow_to_run, text, headers, app, bot_id)
        return output

    logger.error("Failed to map the user requeest to any flow/actions")
    return BotResponse(text="We could not match any actions/flows to your request, our technical team has been notified")


def determine_flow_to_run(actions, flows, bot_id) -> Optional[FlowDTO]:
    """
    Determine which flow to run based on actions and flows.

    Parameters:
    actions: List of actions.
    flows: List of flows.
    bot_id: Identifier for the bot.

    Returns:
    Optional[FlowDTO]: The determined flow to run, or None if not found.
    """

    if actions:
        return create_flow_from_actions(actions, bot_id)
    elif flows:
        return create_flow_from_flows(flows, bot_id)
    return None


def create_flow_from_actions(actions, bot_id) -> FlowDTO:
    """
    Create a flow from the provided actions.

    Parameters:
    actions: List of actions.
    bot_id: Identifier for the bot.

    Returns:
    FlowDTO: The flow created from the actions.
    """

    action = actions[0]
    operation_id = cast(str, action.document.metadata.get("operation_id"))
    return create_flow_from_operation_ids(operation_ids=[operation_id], bot_id=bot_id)


def create_flow_from_flows(flows, bot_id) -> FlowDTO:
    """
    Create a flow from the provided flows.

    Parameters:
    flows: List of flows.
    bot_id: Identifier for the bot.

    Returns:
    FlowDTO: The flow created from the flows.
    """

    flow_with_relevance_score = flows[0]
    flow = flow_with_relevance_score.document
    flow_id = cast(str, flow.metadata.get("flow_id"))
    flow_model = get_flow_by_id(flow_id)

    if flow_model:
        return FlowDTO(
            id=flow_model.id,
            bot_id=bot_id,
            flow_id=flow_model.id,
            name=flow_model.name,
            description=flow_model.description,
            blocks=flow_model.payload,
            variables=[],
        )

    return None


async def execute_flow(flow, text, headers, app, bot_id) -> BotResponse:
    """
    Execute the specified flow.

    Parameters:
    flow: The flow to be executed.
    text: Text input from the user.
    headers: Headers for the HTTP request.
    app: Optional application identifier.
    bot_id: Identifier for the bot.

    Returns:
    BotResponse: The response from the executed flow.
    """

    chat_context = ChatContext(text, headers, app)
    return await run_flow(flow=flow, chat_context=chat_context, app=app, bot_id=bot_id)


def run_informative_item(
        informative_item: dict[str, List[DocumentSimilarityDTO]],
        base_prompt: str,
        text: str,
        conversations_history: List[BaseMessage],
) -> BotResponse:
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

    return BotResponse(text=content)
