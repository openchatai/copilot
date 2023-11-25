import os
from typing import Optional

from langchain.docstore.document import Document
from typing import Tuple
from opencopilot_utils import StoreOptions
from opencopilot_utils.get_vector_store import get_vector_store

from utils import struct_log


def check_workflow_in_store(
    text: str, namespace: str
) -> Tuple[Optional[Document], Optional[float]]:
    try:
        score_threshold = float(os.getenv("SCORE_THRESHOLD", "0.95"))
        vector_store = get_vector_store(StoreOptions("swagger"))
        result = vector_store.similarity_search_with_relevance_scores(
            text, score_threshold=score_threshold
        )[0]

        document, score = result
        return document, score

    except Exception as e:
        struct_log.exception(
            payload={"text": text, "namespace": namespace},
            error=str(e),
            event="/check_workflow_in_store",
        )
        return None, None
