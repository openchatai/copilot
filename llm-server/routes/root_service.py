import asyncio
import os
from typing import Dict, Optional, List, cast

from langchain_core.messages import BaseMessage, SystemMessage, HumanMessage

from custom_types.response_dict import LLMResponse, ApiRequestResult
from custom_types.run_workflow_input import ChatContext
from entities.flow_entity import FlowDTO
from models.repository.action_call_repo import add_action_call
from models.repository.flow_repo import get_flow_by_id
from routes.flow.utils import create_flow_from_operation_ids, run_flow

from routes.flow.utils.document_similarity_dto import (
    DocumentSimilarityDTO,
)
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections
from flask_socketio import emit

logger = CustomLogger(module_name=__name__)

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
    session_id: str,
    is_streaming: bool,
) -> LLMResponse:
    actions = actionable_item.get(VectorCollections.actions)
    flows = actionable_item.get(VectorCollections.flows)
    output = LLMResponse(
        error=None, message=None, api_request_response=ApiRequestResult()
    )
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
            session_id=session_id,
            is_streaming=is_streaming,
        )

        # @Todo convert to bulk
        for operation_id in output.operation_ids:
            add_action_call(
                bot_id=bot_id,
                session_id=session_id,
                operation_id=operation_id,
            )

    return output


async def run_informative_item(
    informative_item: dict[str, List[DocumentSimilarityDTO]],
    base_prompt: str,
    text: str,
    conversations_history: List[BaseMessage],
    is_streaming: bool,
    session_id: str,
) -> LLMResponse:
    # so we got all context, let's ask:

    context = []
    for vector_result in informative_item.get(VectorCollections.knowledgebase) or []:
        context.append(
            vector_result.document.page_content
            + f" metadata: {vector_result.document.metadata}"
        )

    messages: List[BaseMessage] = [SystemMessage(content=base_prompt)]

    if len(conversations_history) > 0:
        messages.extend(conversations_history)

    if len(context):
        messages.append(
            HumanMessage(
                content=f"I found some relevant context that might be helpful. Here is the context: ```{','.join(context)}```. "
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

    emit(
        f"{session_id}_info", "Distilling the information received...\n"
    ) if is_streaming else None
    messages.append(HumanMessage(content=text))

    # convert to astream
    content = ""
    for chunk in chat.stream(messages):
        emit(session_id, chunk.content) if is_streaming else None
        content += str(chunk.content)

    # return {"response": content, "error": None}
    return LLMResponse(
        message=content,
        error=None,
        api_request_response=ApiRequestResult(),
        knowledgebase_called=True,
    )
