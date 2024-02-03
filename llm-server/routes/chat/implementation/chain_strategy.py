from flask_socketio import emit
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from routes.chat.followup_generator import generate_follow_up_questions
from routes.chat.implementation.handler_interface import ChatRequestHandler
from typing import Dict, Optional
import asyncio
import threading
from custom_types.response_dict import LLMResponse
from routes.flow.utils.api_retrievers import (
    get_relevant_actions,
    get_relevant_flows,
    get_relevant_knowledgebase,
)
from routes.flow.utils.document_similarity_dto import select_top_documents

from routes.flow.utils.process_conversation_step import get_next_response_type
from routes.root_service import (
    check_required_fields,
    is_the_llm_predicted_operation_id_actually_true,
    run_actionable_item,
    run_informative_item,
)
from utils.llm_consts import VectorCollections
from models.repository.action_call_repo import add_action_call
from utils.llm_consts import enable_followup_questions


class ChainStrategy(ChatRequestHandler):
    async def handle_request(
        self,
        text: str,
        session_id: str,
        base_prompt: str,
        bot_id: str,
        headers: Dict[str, str],
        app: Optional[str],
        is_streaming: bool,
    ) -> LLMResponse:
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

        (
            emit(f"{session_id}_info", "Checking if actionable ... \n")
            if is_streaming
            else None
        )
        next_step = get_next_response_type(
            user_message=text,
            session_id=session_id,
            chat_history=conversations_history,
            top_documents=top_documents,
        )

        (
            emit(
                f"{session_id}_info",
                f"Is next step actionable: {next_step.actionable}... \n",
            )
            if is_streaming
            else None
        )
        if next_step.actionable and next_step.api:
            # if the LLM given operationID is actually exist, then use it, otherwise fallback to the highest vector space document
            llm_predicted_operation_id = (
                is_the_llm_predicted_operation_id_actually_true(
                    next_step.api, top_documents
                )
            )
            if llm_predicted_operation_id:
                actionable_item = llm_predicted_operation_id
            else:
                actionable_item = select_top_documents(
                    actions + flows,
                    [VectorCollections.actions, VectorCollections.flows],
                )
            # now run it
            (
                emit(f"{session_id}_info", "Executing the actionable item... \n")
                if is_streaming
                else None
            )
            response = await run_actionable_item(
                bot_id=bot_id,
                actionable_item=actionable_item,
                app=app,
                headers=headers,
                text=text,
                is_streaming=is_streaming,
                session_id=session_id,
            )

            response.api_called = True
            if (
                actionable_item
                and "actions" in actionable_item
                and actionable_item["actions"]
            ):
                action = actionable_item["actions"][0]
                operation_id = action.document.metadata.get("operation_id", "")
                add_action_call(
                    operation_id=operation_id, session_id=session_id, bot_id=bot_id
                )
            return response

        else:
            # it means that the user query is "informative" and can be answered using text only
            # get the top knowledgeable documents (if any)
            (
                emit(f"{session_id}_info", "Running informative action... \n")
                if is_streaming
                else None
            )
            response = await run_informative_item(
                informative_item=top_documents,
                base_prompt=base_prompt,
                text=text,
                conversations_history=conversations_history,
                is_streaming=is_streaming,
                session_id=session_id,
            )

            emit(session_id, "|im_end|") if is_streaming else None

            # we only support follow_up question this in streaming mode

            if enable_followup_questions:
                followup_question_list = await generate_follow_up_questions(
                    conversations_history, response.message or "", text
                )
                if is_streaming:
                    emit(f"{session_id}_follow_qns", followup_question_list.json())
            response.knowledgebase_called = True
            return response
