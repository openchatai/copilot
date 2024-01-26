import uuid
from typing import List, Optional

from pydantic import BaseModel

from entities.action_entity import ActionDTO
from .utils import generate_operation_id_from_name


class Block(BaseModel):
    id: str = str(uuid.uuid4())
    actions: List[ActionDTO]
    name: str
    next_on_fail: Optional[str] = None
    next_on_success: Optional[str] = None
    order: int = 0

    def to_dict(self):
        # Convert the entire Block to a dictionary,
        return self.dict()


class Variable(BaseModel):
    name: str
    value: str

    def to_dict(self):
        # Convert the entire Variable to a dictionary,
        return self.dict()


class FlowDTO(BaseModel):
    blocks: List[Block]
    bot_id: str
    id: str
    name: str
    description: str
    variables: List[Variable]
    operation_id: str = None  # it's optional for backward compatibility

    def __init__(self, **data):
        super().__init__(**data)
        # Generate and assign operation_id if name is provided
        if self.name and not self.operation_id:
            self.operation_id = generate_operation_id_from_name(self.name)

    def to_dict(self):
        # Convert the entire FlowDTO to a dictionary,
        # including nested ActionDTO objects within each Block
        return self.dict()

    def get_all_action_ids(self):
        action_ids = []
        for block in self.blocks:
            if block.actions:
                for action in block.actions:
                    if action.id:
                        action_ids.append(action.id)
        return action_ids


class PartialFlowDTO(BaseModel):
    bot_id: str
    id: str
    operation_id: str = None  # it's optional for backward compatibility

    def __init__(self, **data):
        super().__init__(**data)
        # Generate and assign operation_id if name is provided
        if self.name and not self.operation_id:
            self.operation_id = generate_operation_id_from_name(self.name)
