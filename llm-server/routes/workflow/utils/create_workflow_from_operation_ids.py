from typing import List

from models.repository.action_repo import find_action_by_operation_id
from opencopilot_types.workflow_type import (
    WorkflowDataType,
    WorkflowFlowType,
    WorkflowStepType,
)


def create_workflow_from_operation_ids(
        op_ids: List[str], user_input: str
) -> WorkflowDataType:
    flows: List[WorkflowFlowType] = []

    for op_id in op_ids:
        operation = find_action_by_operation_id(op_id)
        step: WorkflowStepType = {
            "stepId": str(op_ids.index(op_id)),
            "operation": "call",
            "open_api_operation_id": op_id,
            "parameters": {},
        }
        flow: WorkflowFlowType = {
            "name": operation.name,
            "description": operation.description,
            "requires_confirmation": False,
            "steps": [step],
            "on_success": [{"handler": "plotOutcomeJsFunction"}],
            "on_failure": [{"handler": "plotOutcomeJsFunction"}],
        }
        flows.append(flow)

    workflow: WorkflowDataType = {
        "opencopilot": "0.1",
        "info": {"title": user_input, "version": "1.0.0"},
        "flows": flows,
        "swagger_url": None,
    }

    return workflow
