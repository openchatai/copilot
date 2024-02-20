from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from shared.models.opencopilot_db.database_setup import async_engine, Base


class APICallBase(BaseModel):
    id: int
    url: str
    path: str
    method: str
    path_params: Optional[str] = None
    query_params: Optional[str] = None
    created_at: datetime

    class Config:
        orm_mode = True


Base.metadata.create_all(async_engine)
