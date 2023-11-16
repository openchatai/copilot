import os, logging, json
from typing import Any
from langchain.schema import HumanMessage, SystemMessage

# push it to the library
from opencopilot_utils.get_vector_store import get_vector_store
from opencopilot_utils import StoreOptions
from custom_types.action_type import ActionType
from utils.chat_models import CHAT_MODELS
from utils import get_chat_model
from typing import Optional, Tuple, List
from langchain.docstore.document import Document
from langchain.vectorstores.base import VectorStore
from prance import ResolvingParser

chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo)


def get_relevant_docs(text: str, bot_id: str) -> Optional[str]:
    try:
        score_threshold = float(os.getenv("SCORE_THRESHOLD_KB", 0.75))
        vector_store: VectorStore = get_vector_store(StoreOptions(bot_id))
        result = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=score_threshold
        )

        if result and len(result) > 0:
            (document, score) = result[0]
            return document.page_content

        return None

    except Exception as e:
        logging.info(f"[Error] {e}")
        return None


def classify_text(user_requirement: str, context: str) -> ActionType:
    messages = [
        SystemMessage(
            content=f"You are a classification model, which when given user input can classify it into one of the three types below"
        ),
        HumanMessage(
            content=f"""
                If the user asks you to list something, show or delete something. You should output {ActionType.ASSISTANT_ACTION.value} because these require making api calls. Otherwise output {ActionType.KNOWLEDGE_BASE_QUERY.value}
            """
        ),
        HumanMessage(content=f"Here's the user requirement - {user_requirement}"),
        HumanMessage(
            content=f"""
                Now output the classification you think is best
            """
        ),
    ]

    content = chat(messages).content

    if ActionType.ASSISTANT_ACTION.value in content:
        return ActionType.ASSISTANT_ACTION

    elif context is not None:
        return ActionType.KNOWLEDGE_BASE_QUERY

    return ActionType.GENERAL_QUERY


def get_action_type(user_requirement: str, bot_id: str) -> ActionType:
    context = get_relevant_docs(user_requirement, bot_id) or None

    route = classify_text(user_requirement, context)

    return route
