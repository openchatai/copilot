from typing import Optional

from langchain.pydantic_v1 import BaseModel, Field


class ActionableOrNotType(BaseModel):
    actionable: bool = Field(description="is the message actionable or not")
    operation_id: Optional[str] = Field(description="the api operation id")


def parse_actionable_or_not_response(json_dict: dict) -> ActionableOrNotType:
    return ActionableOrNotType(**json_dict)
