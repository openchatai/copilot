import os, logging, json
from typing import Any
from langchain.schema import HumanMessage, SystemMessage

# push it to the library
from opencopilot_utils.get_vector_store import get_vector_store
from opencopilot_utils import StoreOptions
from custom_types.action_type import ActionType
from utils import get_chat_model
from typing import Optional, Tuple, List
from langchain.docstore.document import Document
from langchain.vectorstores.base import VectorStore
from prance import ResolvingParser

chat = get_chat_model("gpt-3.5-turbo")


def get_relevant_docs(text: str, namespace: str) -> Optional[str]:
    score_threshold = float(os.getenv("SCORE_THRESHOLD_KB", 0.75))
    vector_store: VectorStore = get_vector_store(StoreOptions(namespace.split("/")[-1]))

    try:
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
            content="You are a multi-label classification model. Your reply should only be one of the allowed keywords"
        ),
        HumanMessage(
            content=f"""
                You must output one of '{ActionType.ASSISTANT_ACTION.value}', '{ActionType.KNOWLEDGE_BASE_QUERY.value}', '{ActionType.GENERAL_QUERY.value}' based on the following conditions
            """
        ),
        HumanMessage(
            content=f"""
                If the user's requirement would require making an API call to a third-party service, return the output as: {ActionType.ASSISTANT_ACTION.value}. 
                
                Actions such as performing tasks, listing items, displaying information, and managing additions/removals are all categorized as assistant actions etc, are all assistant actions
            """
        ),
        HumanMessage(
            content=f"""
                If the user's requirement is related to this context ```{context}```, output: {ActionType.KNOWLEDGE_BASE_QUERY.value}
                If you are unsure, output: {ActionType.GENERAL_QUERY.value}
            """
        ),
        HumanMessage(
            content="Here's the user input {}".format(user_requirement),
        ),
    ]

    content = chat(messages).content

    if ActionType.ASSISTANT_ACTION.value in content:
        return ActionType.ASSISTANT_ACTION

    elif ActionType.KNOWLEDGE_BASE_QUERY.value in content:
        return ActionType.KNOWLEDGE_BASE_QUERY

    return ActionType.GENERAL_QUERY


def get_action_type(user_requirement: str, url: str) -> ActionType:
    namespace = url.split("/")[-1]
    context = get_relevant_docs(user_requirement, namespace) or []

    route = classify_text(user_requirement, context)

    return route
