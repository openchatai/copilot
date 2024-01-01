from routes.chat.implementation.handler_interface import RequestHandler
from typing import Callable, Dict, List, Any

from custom_types.response_dict import ResponseDict
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from shared.models.opencopilot_db import ChatHistory


class FunctionStrategy(RequestHandler):
    def __init__(self, function: Callable):
        self.function = function

    def handle_request(
        self,
        top_documents: Dict[str, List[DocumentSimilarityDTO]],
        chat_history: List[ChatHistory],
        session_id: str,
        user_message: str,
        is_streaming: bool,
    ) -> ResponseDict:
        # Extract relevant information from inputs
        raise NotImplementedError("Subclasses must override handle_request.")
