from typing import Optional

from werkzeug.datastructures import Headers

from custom_types.bot_response import BotResponse
from custom_types.run_workflow_input import ChatContext
from entities.flow_entity import FlowDTO
from routes.flow.utils import run_actions
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


async def run_flow(
        flow: FlowDTO,
        chat_context: ChatContext,
        app: Optional[str],
        bot_id: str,
) -> BotResponse:
    headers = chat_context.headers or Headers()

    try:
        result = await run_actions(
            flow=flow,
            text=chat_context.text,
            headers=headers,
            app=app,
            bot_id=bot_id,
        )
    except Exception as e:
        logger.error("An exception occurred during running actions", error=str(e))
        return BotResponse(errors=str(e))

    return result
