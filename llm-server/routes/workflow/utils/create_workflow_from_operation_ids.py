from typing import Any, List, Dict
from routes.workflow.utils.get_swagger_op_by_id import get_operation_by_id
from prance import ResolvingParser
from opencopilot_types.workflow_type import (
    WorkflowDataType,
    WorkflowFlowType,
    WorkflowStepType,
)


def create_workflow_from_operation_ids(
    op_ids: List[str], swagger_doc: ResolvingParser
) -> Any:
    flows = []

    for op_id in op_ids:
        operation = get_operation_by_id(swagger_doc, op_id)
        step: WorkflowStepType = {
            "stepId": str(op_ids.index(op_id)),
            "operation": "call",
            "open_api_operation_id": op_id,
            "parameters": {},
        }
        flow: WorkflowFlowType = {
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
