from datetime import datetime
from typing import Optional
from shared.models.opencopilot_db.database_setup import async_engine, Base
from pydantic import BaseModel

from uuid import UUID


class ChatbotSettingBase(BaseModel):
    id: UUID
    chatbot_id: Optional[UUID] = None
    name: Optional[str] = None
    value: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


Base.metadata.create_all(async_engine)
