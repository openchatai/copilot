from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


class ChatInput(BaseModel):
    id: str = Field(None, alias="id")
    content: str
    session_id: str = Field(..., alias="session_id")
    headers: dict = {}
    bot_token: str = Field(..., alias="bot_token")
    extra_params: Optional[Dict[str, str]] = Field(None, alias="query_params")
