from abc import ABC, abstractmethod
from typing import Dict, List
from custom_types.response_dict import ResponseDict
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from shared.models.opencopilot_db import ChatHistory


class RequestHandler(ABC):
    @abstractmethod
    def handle_request(
        self,
        top_documents: Dict[str, List[DocumentSimilarityDTO]],
        chat_history: List[ChatHistory],
        session_id: str,
        user_message: str,
        is_streaming: bool,
    ) -> ResponseDict:
        pass
