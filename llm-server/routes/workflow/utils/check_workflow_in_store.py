from typing import Any, Dict, Optional

from langchain.vectorstores.base import VectorStore
from langchain.docstore.document import Document
from typing import Tuple
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
import logging, os


def check_workflow_in_store(
    text: str, namespace: str
) -> Tuple[Optional[Document], Optional[float]]:
    score_threshold = os.getenv("SCORE_THRESHOLD", 0.95)
    vector_store = get_vector_store(StoreOptions(namespace.split("/")[-1]))

    try:
        result = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=score_threshold
        )[0]

        document, score = result
        return document, score

    except Exception as e:
        logging.info(f"[Error] {e}")
        return None, None
