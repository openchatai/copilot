from pydantic import BaseModel
from typing import List, Optional


class Step(BaseModel):
    operationId: str
    id: str
    path: str
    method: str
    parameters: List[dict]
    summary: str
    description: Optional[str]
    tags: List[str]
    operation: str


class Workflow(BaseModel):
    opencopilot: dict
    name: str
    description: str
    info: dict
    requires_confirmation: bool
    on_failure: List[dict]
    on_success: List[dict]
    steps: Optional[List[Step]]


class WorkflowCreate(Workflow):
    bot_id: Optional[str]
