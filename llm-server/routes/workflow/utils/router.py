import os
from langchain.schema import HumanMessage, SystemMessage, BaseMessage
from routes.workflow.extractors.extract_json import extract_json_payload

# push it to the library
from opencopilot_utils.get_vector_store import get_vector_store
from opencopilot_utils import StoreOptions
from custom_types.action_type import ActionType
from integrations.custom_prompts.prompt_loader import load_prompts
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from utils.chat_models import CHAT_MODELS
from utils import get_chat_model
from typing import Optional, List, Union
from langchain.vectorstores.base import VectorStore
from utils.get_logger import struct_log

chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)


def get_relevant_docs(text: str, bot_id: str) -> Optional[str]:
    try:
        score_threshold = float(os.getenv("SCORE_THRESHOLD_KB", "0.75"))
        vector_store: VectorStore = get_vector_store(StoreOptions("knowledgebase"))

        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 3,
                "score_threshold": score_threshold,
                "filter": {"bot_id": bot_id},
            },
        )

        result = retriever.get_relevant_documents(text)

        if result and len(result) > 0:
            # Assuming result is a list of objects and each object has a page_content attribute
            all_page_content = "\n\n".join([item.page_content for item in result])

            return all_page_content

        return None

    except Exception as e:
        struct_log.exception(payload=text, error=str(e), event="get_relevant_docs")
        return None


def classify_text(
    user_requirement: str, context: Optional[str], session_id: str, app: Optional[str]
) -> Union[str, ActionType]:
    prev_conversations = []
    if session_id:
        prev_conversations = get_chat_message_as_llm_conversation(session_id)

    prompt_templates = load_prompts(app)
    custom_classification_prompt = None

    if app and prompt_templates:
        custom_classification_prompt = prompt_templates.classification_prompt

    struct_log.info(
        event="select_classification_prompt",
        app=app,
        context=context,
        classification_prompt=custom_classification_prompt,
        selected_prompt=custom_classification_prompt,
    )

    messages: List[BaseMessage] = [
        SystemMessage(
            content="You possess the ability to categorize user input into predefined types determined by the user."
        )
    ]

    # adding prev conversations
    messages.extend(prev_conversations)
    if custom_classification_prompt is not None:
        messages.append(SystemMessage(content=custom_classification_prompt))
    else:
        messages.append(
            HumanMessage(
                content=f"Respond with the string '{ActionType.ASSISTANT_ACTION.value}' for questions that are centered around data / api calling or questions related to math / data of an organization / api calls etc . Output '{ActionType.KNOWLEDGE_BASE_QUERY.value}' if and only if question can confidently be answered from the context provided in the chat."
            )
        )

    messages.append(HumanMessage(content=f"provided context: {context}"))
    messages.append(
        HumanMessage(
            content="If the user is inquiring about a previous question, produce the same category as output as the one to which this follow-up pertains."
        )
    )
    messages.append(
        HumanMessage(
            content=f"If the question cannot be answered from the provided context output {ActionType.ASSISTANT_ACTION.value}"
        )
    )

    messages.append(
        HumanMessage(content=user_requirement),
    )

    content = chat(messages).content

    struct_log.info(
        event="classification_model_output", data=content, messages=messages
    )
    if ActionType.ASSISTANT_ACTION.value in content:
        return ActionType.ASSISTANT_ACTION
    elif ActionType.KNOWLEDGE_BASE_QUERY.value in content:
        return ActionType.KNOWLEDGE_BASE_QUERY
    else:
        return content


def get_action_type(
    user_requirement: str, bot_id: str, session_id: str, app: Optional[str]
) -> Union[str, ActionType]:
    context = get_relevant_docs(user_requirement, bot_id) or None

    route = classify_text(user_requirement, context, session_id, app)

    return route
