from typing import Optional
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser


class ActionableOrNotType(BaseModel):
    actionable: bool = Field(description="is the message actionable or not")
    api: Optional[str] = Field(description="the api operation id")


def parse_actionable_or_not_response(json_dict: dict) -> ActionableOrNotType:
    return ActionableOrNotType(**json_dict)


class InformativeOrActionable(BaseModel):
    needs_api: str = Field(description="Indicates whether the API is needed or not.")
    justification: str = Field(description="A brief justification for the request.")
    api: Optional[str] = Field(description="The API to be called.")


def parse_informative_or_actionable_response(input: str) -> InformativeOrActionable:
    parser = PydanticOutputParser(pydantic_object=InformativeOrActionable)
    return parser.parse(input)
