import json
import logging
from typing import Optional
import requests

from werkzeug.datastructures import Headers

from custom_types.response_dict import ApiRequestResult, LLMResponse
from custom_types.run_workflow_input import ChatContext
from entities.flow_entity import FlowDTO
from routes.flow.utils import run_actions
from utils.get_logger import CustomLogger
from entities.flow_entity import Block
from entities.flow_entity import Block

logger = CustomLogger(module_name=__name__)


async def run_flow(
    flow: FlowDTO,
    chat_context: ChatContext,
    app: Optional[str],
    bot_id: str,
    session_id: str,
    is_streaming: bool,
) -> LLMResponse:
    headers = chat_context.headers or Headers()

    result = ""
    error = None
    api_request_data = {}
    try:
        result, api_request_data = await run_actions(
            flow=flow,
            text=chat_context.text,
            headers=headers,
            app=app,
            bot_id=bot_id,
            session_id=session_id,
            is_streaming=is_streaming,
        )
    except Exception as e:
        payload_data = {
            "headers": dict(headers),
            "app": app,
        }

        logger.error(
            "An exception occurred",
            bot_id=bot_id,
            payload=json.dumps(payload_data),
            error=e,
        )

    output = {"response": result if not error else "", "error": error}

    logging.info("Workflow output %s", json.dumps(output, separators=(",", ":")))
    return LLMResponse(
        api_request_response=ApiRequestResult(api_request_data),
        error=output["error"],
        message=output["response"],
        api_called=True,
        operation_ids=flow.get_all_action_ids(),
    )
