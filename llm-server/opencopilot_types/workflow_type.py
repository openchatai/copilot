from typing import TypedDict, List


class WorkflowStepType(TypedDict):
    stepId: str
    operation: str
    open_api_operation_id: str
    parameters: dict


class WorkflowFlowType(TypedDict):
    name: str
    description: str
    requires_confirmation: bool
    steps: List[WorkflowStepType]
    on_success: List[dict]
    on_failure: List[dict]


class WorkflowDataType(TypedDict):
    opencopilot: str
    info: dict
    flows: List[WorkflowFlowType]
