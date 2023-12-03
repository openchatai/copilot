from typing import Any, Dict, Optional

from langchain.vectorstores.base import VectorStore
from langchain.docstore.document import Document
from shared.utils.opencopilot_utils import StoreOptions
from shared.utils.opencopilot_utils.get_vector_store import get_vector_store
import os

from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


def check_workflow_in_store(text: str, bot_id: str) -> Optional[Document]:
    try:
        vector_store = get_vector_store(StoreOptions("swagger"))
        score_threshold = float(os.getenv("SCORE_THRESHOLD", "0.91"))
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 5,
                "score_threshold": score_threshold,
                "filter": {"bot_id": bot_id},
            },
        )

        result = retriever.get_relevant_documents(text)
        logger.info(
            "Information about the event",
            extra={"incident": "check_workflow_in_store"},
        )

        if len(result) > 0:
            result[0]

        return None

    except Exception as e:
        payload_data = {"text": text, "bot_id": bot_id}
        error_data = {
            "payload": payload_data,
            "error": str(e),
            "incident": "check_workflow_in_store",
        }

        logger.error("An exception occurred", extra=error_data)
        return None
