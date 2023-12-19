import uuid
from typing import List, Optional

from pydantic import BaseModel

from entities.action_entity import ActionDTO


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


class PartialFlowDTO(BaseModel):
    bot_id: str
    id: str
    operation_id: str = None  # it's optional for backward compatibility

    def __init__(self, **data):
        super().__init__(**data)
        # Generate and assign operation_id if name is provided
        if self.name and not self.operation_id:
            self.operation_id = generate_operation_id_from_name(self.name)


def generate_operation_id_from_name(content: str) -> str:
    words = content.split()
    # Capitalize the first letter of each word except the first one
    camel_case_words = [words[0].lower()] + [
        word.capitalize() for word in words[1:]
    ]
    # Join the words to form the camelCase ID
    return "".join(camel_case_words)
