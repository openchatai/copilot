from pydantic import BaseModel, Field


class AiRequestFormat(BaseModel):
    """Identifying information about a person."""

    path: str = Field(..., description="The path of the route")
    method: str = Field(
        ...,
        description="The request method of the route could be GET or POST, DELETE, PUT, PATCH",
    )


class AiResponseFormat(BaseModel):
    """Identifying information about a person."""

    response: str = Field(..., description="The AI response in markdown")
