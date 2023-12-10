import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

from entities.action_entity import ActionDTO


class Block(BaseModel):
    actions: List[ActionDTO]
    name: str
    next_on_fail: Optional[str] = None
    next_on_success: Optional[str] = None
    order: int
    status: str


class Variable(BaseModel):
    name: str
    value: str


class FlowDTO(BaseModel):
    blocks: List[Block]
    chatbot_id: uuid.UUID
    id: uuid.UUID
    name: str
    status: str
    variables: List[Variable]
