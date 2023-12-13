import json

from langchain.pydantic_v1 import BaseModel, Field


class ActionableOrNotType(BaseModel):
    actionable: bool = Field(description="is the message actionable or not")


def parse_actionable_or_not_response(json_string: str) -> ActionableOrNotType:
    # Parse the JSON string into a Python dictionary
    data = json.loads(json_string)

    # Create an instance of ActionableOrNotType
    return ActionableOrNotType(**data)

