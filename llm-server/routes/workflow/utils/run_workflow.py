from typing import Any, Dict
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils.run_openapi_ops import run_openapi_operations
from opencopilot_types.workflow_type import WorkflowDataType


def run_workflow(
    workflow_doc: WorkflowDataType, swagger_json: Any, data: WorkflowData
) -> Dict[str, Any]:
    headers = data.headers or {}
    server_base_url = data.server_base_url

    result = run_openapi_operations(
        workflow_doc, swagger_json, data.text, headers, server_base_url
    )

    return {"response": result}
