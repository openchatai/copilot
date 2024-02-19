from pydantic import BaseModel, Field


class ChatInput(BaseModel):
    content: str
    session_id: str = Field(..., alias="session_id")
    headers: dict = {}
    bot_token: str = Field(..., alias="bot_token")
