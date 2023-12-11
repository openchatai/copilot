import json
import logging
from typing import Optional

from werkzeug.datastructures import Headers

from entities.flow_entity import FlowDTO
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import ChatContext
from routes.workflow.utils.run_openapi_ops import run_actions
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


async def run_flow(
        flow: FlowDTO,
        chat_context: ChatContext,
        app: Optional[str],
        bot_id: str,
) -> ResponseDict:
    headers = chat_context.headers or Headers()

    result = ""
    error = None

    try:
        result = await run_actions(
            flow=flow,
            text=chat_context.text,
            headers=headers,
            app=app,
            bot_id=bot_id,
        )
    except Exception as e:
        payload_data = {
            "headers": dict(headers),
            "app": app,
        }

        logger.error("An exception occurred", payload= json.dumps(payload_data), error= str(e))

    output = {"response": result if not error else "", "error": error}

    logging.info(
        "Workflow output %s", json.dumps(output, separators=(",", ":"))
    )
    return output
