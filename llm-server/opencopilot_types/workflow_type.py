from typing import TypedDict, List, Dict, Any


class WorkflowStepType(TypedDict):
    stepId: str
    operation: str
    open_api_operation_id: str
    parameters: Dict[str, Any]


class WorkflowFlowType(TypedDict):
    name: str
    description: str
    requires_confirmation: bool
    steps: List[WorkflowStepType]
    on_success: List[Dict[str, Any]]
    on_failure: List[Dict[str, Any]]


class WorkflowDataType(TypedDict):
    opencopilot: str
    info: Dict[str, Any]
    flows: List[WorkflowFlowType]
