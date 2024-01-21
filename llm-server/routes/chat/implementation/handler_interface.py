from abc import ABC, abstractmethod
from typing import Awaitable, Dict, Optional
from custom_types.response_dict import LLMResponse
from asyncio import Future


class ChatRequestHandler(ABC):
    @abstractmethod
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
        pass
