from typing import Any, Optional
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils.run_openapi_ops import run_openapi_operations
from opencopilot_types.workflow_type import WorkflowDataType
from werkzeug.datastructures import Headers
import logging
import json

from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


async def run_workflow(
    workflow_doc: WorkflowDataType,
    swagger_json: Any,
    data: WorkflowData,
    app: Optional[str],
    bot_id: str,
    summary_prompt: str,
) -> ResponseDict:
    headers = data.headers or Headers()
    server_base_url = data.server_base_url

    result = ""
    error = None

    try:
        result = await run_openapi_operations(
            workflow_doc,
            swagger_json,
            data.text,
            headers,
            server_base_url,
            app,
            bot_id=bot_id,
            summary_prompt=summary_prompt,
        )
    except Exception as e:
        payload_data = {
            "headers": dict(headers),
            "server_base_url": server_base_url,
            "app": app,
        }

        error_data = {
            "payload": json.dumps(payload_data),
            "error": str(e),
            "incident": "run_workflow",
        }

        logger.error("An exception occurred", error=error_data)
        error = str(e)

    output: ResponseDict = {"response": result if not error else "", "error": error}

    logging.info("Workflow output %s", json.dumps(output, separators=(",", ":")))

    return output
