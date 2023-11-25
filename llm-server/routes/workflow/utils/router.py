import os
from langchain.schema import HumanMessage, SystemMessage, BaseMessage

# push it to the library
from opencopilot_utils.get_vector_store import get_vector_store
from opencopilot_utils import StoreOptions
from custom_types.action_type import ActionType
from models.repository.chat_history_repo import get_chat_message_as_llm_conversation
from utils.chat_models import CHAT_MODELS
from utils import get_chat_model
from typing import Optional, List
from langchain.vectorstores.base import VectorStore
from utils import struct_log


chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo)


def get_relevant_docs(text: str, bot_id: str) -> Optional[str]:
    try:
        score_threshold = float(os.getenv("SCORE_THRESHOLD_KB", "0.75"))
        vector_store: VectorStore = get_vector_store(StoreOptions("knowledgebase"))

        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 5,
                "score_threshold": score_threshold,
                "filter": {"bot_id": bot_id},
            },
        )

        result = retriever.get_relevant_documents(text)

        if result and len(result) > 0:
            return result[0].page_content

        return None

    except Exception as e:
        struct_log.exception(payload=text, error=str(e), event="get_relevant_docs")
        return None


def classify_text(
    user_requirement: str, context: Optional[str], session_id: str
) -> ActionType:
    prev_conversations: List[BaseMessage] = []
    if session_id:
        prev_conversations = get_chat_message_as_llm_conversation(session_id)

    messages: List[BaseMessage] = [
        SystemMessage(
            content=f"""You are a classification model, which when given user input can classify it into one of the three types below. If the user asks you to list something, show or delete something. You should output {ActionType.ASSISTANT_ACTION.value} because these require making api calls.  {ActionType.KNOWLEDGE_BASE_QUERY.value}"""
        )
    ]

    if len(prev_conversations) > 0:
        messages.extend(prev_conversations)

    messages.extend(
        [
            HumanMessage(
                content=f"Here's the user requirement:```{user_requirement}```, and here's the context: ```{context}```. Now classify the user requirement."
            ),
        ]
    )

    content = chat(messages).content

    if ActionType.ASSISTANT_ACTION.value in content:
        return ActionType.ASSISTANT_ACTION

    elif context is not None:
        return ActionType.KNOWLEDGE_BASE_QUERY

    return ActionType.GENERAL_QUERY


def get_action_type(user_requirement: str, bot_id: str, session_id: str) -> ActionType:
    context = get_relevant_docs(user_requirement, bot_id) or None

    route = classify_text(user_requirement, context, session_id)

    return route
