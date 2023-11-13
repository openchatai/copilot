from typing import Any, Dict, Optional

from langchain.vectorstores.base import VectorStore
from langchain.docstore.document import Document
from typing import Tuple
from opencopilot_utils import StoreOptions
from opencopilot_utils.get_vector_store import get_vector_store
import logging, os


def check_workflow_in_store(
    text: str, namespace: str
) -> Tuple[Optional[Document], Optional[float]]:

    try:
        score_threshold = float(os.getenv("SCORE_THRESHOLD", "0.95"))
        vector_store = get_vector_store(StoreOptions(namespace.split("/")[-1]))
        result = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=score_threshold
        )[0]

        document, score = result
        return document, score

    except Exception as e:
        logging.error(f"[Error] {e}, {namespace}")
        return None, None
