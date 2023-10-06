from typing import Any, List, Dict
from routes.workflow.utils.get_swagger_op_by_id import get_operation_by_id
from opencopilot_types.workflow_type import WorkflowDataType


def create_workflow_from_operation_ids(
    op_ids: List[str], SWAGGER_SPEC: Dict[str, Any]
) -> Any:
    flows = []

    for op_id in op_ids:
        operation = get_operation_by_id(SWAGGER_SPEC, op_id)
        step = {
            "stepId": str(op_ids.index(op_id)),
            "operation": "call",
            "open_api_operation_id": op_id,
        }
        flow = {
            "name": operation["name"],
            "description": operation["description"],
            "requires_confirmation": False,
            "steps": [step],
            "on_success": [{"handler": "plotOutcomeJsFunction"}],
            "on_failure": [{"handler": "plotOutcomeJsFunction"}],
        }
        flows.append(flow)

    workflow: WorkflowDataType = {
        "opencopilot": "0.1",
        "info": {"title": "<user input as function parameter>", "version": "1.0.0"},
        "flows": flows,
    }

    return workflow
