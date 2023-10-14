from typing import Any, Dict, Optional
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils.run_openapi_ops import run_openapi_operations
from opencopilot_types.workflow_type import WorkflowDataType
from routes.workflow.hierarchical_planner import create_and_run_openapi_agent
import logging, json


def run_workflow(
    workflow_doc: WorkflowDataType,
    swagger_json: Any,
    data: WorkflowData,
    app: Optional[str],
) -> Dict[str, Any]:
    headers = data.headers or {}
    server_base_url = data.server_base_url

    result = ""
    error = None

    try:
        result = run_openapi_operations(
            workflow_doc,
            swagger_json,
            data.text,
            headers,
            server_base_url,
            app,
        )
    except Exception as e:
        logging.error("[OpenCopilot] Custom planner failed: %s", e)
        error = str(e)

        try:
            result = create_and_run_openapi_agent(swagger_json, data.text, headers)
        except Exception as e:
            logging.error("[OpenCopilot] Hierarchical planner failed: %s", e)
            error = str(e)
            raise

    output = {"response": result if not error else "", "error": error}

    logging.info(
        "[OpenCopilot] Workflow output %s", json.dumps(output, separators=(",", ":"))
    )

    return output
