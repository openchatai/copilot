from shared.models.opencopilot_db.database_setup import async_engine, Base

from pydantic import BaseModel
from typing import Optional


class AnalyticsBase(BaseModel):
    chatbot_id: str
    successful_operations: int
    total_operations: int
    logs: Optional[str] = None

    class Config:
        orm_mode = True


Base.metadata.create_all(async_engine)
