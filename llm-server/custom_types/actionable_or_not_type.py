from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel, Field


class ActionableOrNotType(BaseModel):
    actionable: bool = Field(description="is the message actionable or not")


actionable_or_not_parser = PydanticOutputParser(pydantic_object=ActionableOrNotType)


def parse_actionable_or_not_response(response: str) -> ActionableOrNotType:
    return actionable_or_not_parser.parse(response)
