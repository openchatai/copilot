import os, logging, json
from typing import Any
from langchain.schema import HumanMessage, SystemMessage

# push it to the library
from opencopilot_utils import get_vector_store, StoreOptions
from utils import get_chat_model
from typing import Optional, Tuple, List
from langchain.docstore.document import Document
from enum import Enum
from langchain.vectorstores.base import VectorStore


chat = get_chat_model("gpt-3.5-turbo")


class ActionType(Enum):
    ASSISTANT_ACTION = "assistant_action"
    KNOWLEDGE_BASE_QUERY = "knowledge_base_query"
    GENERAL_QUERY = "general_query"


def get_relevant_docs(text: str, namespace: str):
    score_threshold = float(os.getenv("SCORE_THRESHOLD_KB", 0.75))
    vector_store: VectorStore = get_vector_store(StoreOptions(namespace.split("/")[-1]))

    try:
        result = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=score_threshold
        )

        return result

    except Exception as e:
        logging.info(f"[Error] {e}")
        return None


def combine_page_contents(results: List[Tuple[Document, float]]) -> Optional[str]:
    if results is None:
        return None
    combined_contents = "\n\n".join(document.page_content for document, _ in results)
    return combined_contents


def classify_text(user_requirement: str, namespace: str, context: str) -> ActionType:
    messages = [
        SystemMessage(
            content="You are a multi-label classification model, that can classify the user input into - '{}', '{}', '{}'".format(
                ActionType.ASSISTANT_ACTION,
                ActionType.KNOWLEDGE_BASE_QUERY,
                ActionType.GENERAL_QUERY,
            )
        ),
        HumanMessage(
            content="""
                You must output one of '{}', '{}', '{}'
                If the user is asking for a question, information, etc... that can be answered from this context 
                ```
                {}
                ```
                output 'knowledge_base',
                If the user is asking some general question
            """.format(
                ActionType.ASSISTANT_ACTION,
                ActionType.KNOWLEDGE_BASE_QUERY,
                ActionType.GENERAL_QUERY,
                context,  # this comes from the vector database
            )
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
    elif ActionType.GENERAL_QUERY.value in content:
        return ActionType.GENERAL_QUERY

    return (
        ActionType.ASSISTANT_ACTION
    )  # Provide a default action if none of the conditions are met


def execute_correct_llm_call(user_requirement: str, namespace: str):
    results = get_relevant_docs(user_requirement, namespace) or []
    context = combine_page_contents(results)

    route = classify_text(user_requirement, namespace, context)

    if route == ActionType.ASSISTANT_ACTION:
        # use handle single intent function call
        pass

    elif route == ActionType.KNOWLEDGE_BASE_QUERY:
        # use the conversation retrieval qa chain here
        pass

    elif route == ActionType.GENERAL_QUERY:
        # use the general chain
        pass
