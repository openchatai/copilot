from custom_types.response_dict import LLMResponse
from routes.chat.implementation.handler_interface import ChatRequestHandler
from typing import Dict, Optional


class PlannedFlowsStrategy(ChatRequestHandler):
    async def handle_request(
        self,
        text: str,
        session_id: str,
        base_prompt: str,
        bot_id: str,
        headers: Dict[str, str],
        app: Optional[str] = None,
        is_streaming: bool = False,
        *,
        flow_id: str
    ) -> LLMResponse:
        return LLMResponse()
