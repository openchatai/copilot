from typing import List

from langchain.vectorstores.base import VectorStore

from routes.workflow.utils.document_similarity_dto import DocumentSimilarityDTO
from shared.utils.opencopilot_utils import StoreOptions
from shared.utils.opencopilot_utils.get_vector_store import get_vector_store
from utils.chat_models import CHAT_MODELS
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import vs_thresholds

logger = CustomLogger(module_name=__name__)
chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)

knowledgebase: VectorStore = get_vector_store(StoreOptions("knowledgebase"))
flows: VectorStore = get_vector_store(StoreOptions("flows"))
actions: VectorStore = get_vector_store(StoreOptions("actions"))


async def get_relevant_actions(text: str, bot_id: str) -> List[DocumentSimilarityDTO]:
    try:

        documents = actions.similarity_search_with_relevance_scores(text, 4, search_kwargs={
            "k": 3,
            "score_threshold": vs_thresholds.get("flows_score_threshold"),
            "filter": {"bot_id": bot_id},
        })

        documents_with_similarity = []
        for document in documents:
            (doc, score) = document  # Return the document and the score of this document
            documents_with_similarity.append(DocumentSimilarityDTO(document=doc, score=score, type="actions"))

        return documents_with_similarity

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant API summaries",
            incident="get_relevant_actions",
            payload=text,
            error=str(e),
        )
        return []


async def get_relevant_flows(text: str, bot_id: str) -> List[DocumentSimilarityDTO]:
    try:

        documents = flows.similarity_search_with_relevance_scores(text, 4, search_kwargs={
            "k": 3,
            "score_threshold": vs_thresholds.get("flows_score_threshold"),
            "filter": {"bot_id": bot_id},
        })

        documents_with_similarity = []
        for document in documents:
            (doc, score) = document  # Return the document and the score of this document
            documents_with_similarity.append(DocumentSimilarityDTO(document=doc, score=score, type="flows"))

        return documents_with_similarity

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant API summaries",
            incident="get_relevant_actions",
            payload=text,
            error=str(e),
        )
        return []


async def get_relevant_knowledgebase(text: str, bot_id: str) -> List[DocumentSimilarityDTO]:
    try:

        documents = actions.similarity_search_with_relevance_scores(text, 4, search_kwargs={
            "k": 3,
            "score_threshold": vs_thresholds.get("flows_score_threshold"),
            "filter": {"bot_id": bot_id},
        })

        documents_with_similarity = []
        for document in documents:
            (doc, score) = document  # Return the document and the score of this document
            documents_with_similarity.append(DocumentSimilarityDTO(document=doc, score=score, type="knowledgebase"))

        return documents_with_similarity

    except Exception as e:
        logger.error(
            "Error occurred while getting relevant API summaries",
            incident="get_relevant_actions",
            payload=text,
            error=str(e),
        )
        return []
