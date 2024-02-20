from datetime import datetime
import uuid

from shared.models.opencopilot_db.database_setup import Base, async_engine

from typing import Optional
from pydantic import BaseModel, Field


class WebsiteDataSource(BaseModel):
    id: str = Field(default=str(uuid.uuid4()), alias="id")
    chatbot_id: str = Field(default=None, alias="chatbot_id")
    created_at: Optional[datetime] = Field(default=datetime.utcnow, alias="created_at")
    updated_at: Optional[datetime] = Field(default=datetime.utcnow, alias="updated_at")
    status: str = Field(default="PENDING", alias="status")
    url: str = Field(default=None, alias="url")
    error: Optional[str] = Field(default=None, alias="error")


Base.metadata.create_all(async_engine)
