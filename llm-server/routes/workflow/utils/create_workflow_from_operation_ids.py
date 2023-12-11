from typing import List

from models.repository.action_repo import find_action_by_operation_id
from opencopilot_types.workflow_type import (
    WorkflowDataType,
    WorkflowFlowType,
    WorkflowStepType,
)


def create_dynamic_flow_from_operation_ids(
        operation_ids: List[str], user_input: str
) -> WorkflowDataType:
    flows: List[WorkflowFlowType] = []

    for operation_id in operation_ids:
        operation = find_action_by_operation_id(operation_id)
        step: WorkflowStepType = {
            "stepId": str(operation_ids.index(operation_id)),
            "open_api_operation_id": operation_id,
            "parameters": {},
        }
        flow: WorkflowFlowType = {
            "name": operation.name,
            "description": operation.description,
            "requires_confirmation": False,
            "steps": [step],
        }
        flows.append(flow)

    workflow: WorkflowDataType = {
        "opencopilot": "0.1",
        "info": {"title": user_input, "version": "1.0.0"},
        "flows": flows,
        "swagger_url": None,
    }

    return workflow
