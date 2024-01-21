from routes.chat.implementation.handler_interface import ChatRequestHandler
from typing import Dict, Optional

from custom_types.response_dict import LLMResponse
from asyncio import Future


class FunctionStrategy(ChatRequestHandler):
    async def handle_request(
        self,
        text: str,
        session_id: str,
        base_prompt: str,
        bot_id: str,
        headers: Dict[str, str],
        app: Optional[str],
        is_streaming: bool,
    ) -> LLMResponse:
        # Extract relevant information from inputs
        raise NotImplementedError("Subclasses must override handle_request.")
