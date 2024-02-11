from sqlalchemy import Column, Integer, DateTime, String
from shared.models.opencopilot_db.database_setup import Base
import datetime

from .database_setup import engine


class APICall(Base):
    __tablename__ = "api_calls"

    id = Column(Integer, primary_key=True, autoincrement=True)
    url = Column(String(255), nullable=False)
    path = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    path_params = Column(String(255), nullable=True)
    query_params = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


Base.metadata.create_all(engine)
