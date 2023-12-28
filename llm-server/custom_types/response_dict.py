from typing import TypedDict, Optional

from langchain.pydantic_v1 import BaseModel, Field


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]


class BotResponse(BaseModel):
    text_response: str = Field(description="Represent the actual text that will be returned and shown to the end user")
    apis_response: Optional[dict] = Field(default={}, description="Represent the JSON apis responses, it will NOT be shown to the user, and will be used to enrich the copilot chat history")
    errors: Optional[str] = Field(default=None, description="In case the copilot failed to execute an api call, the error will be stored here and shown to the end user")

