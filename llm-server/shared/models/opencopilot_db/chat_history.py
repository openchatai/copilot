from datetime import datetime
from typing import Optional, Dict
from shared.models.opencopilot_db.database_setup import async_engine, Base
from pydantic import BaseModel


class ChatHistoryBase(BaseModel):
    id: int
    chatbot_id: Optional[str] = None
    session_id: Optional[str] = None
    from_user: bool = False
    message: str
    created_at: datetime
    updated_at: datetime
    debug_json: Optional[Dict] = {}
    api_called: bool = False
    knowledgebase_called: bool = False

    class Config:
        orm_mode = True


Base.metadata.create_all(async_engine)
