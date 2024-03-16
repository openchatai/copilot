import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON

from .database_setup import engine
from .get_declarative_base import Base
from dataclasses import dataclass
from sqlalchemy import Index


@dataclass
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(String(36), nullable=True)
    session_id = Column(String(255), nullable=True)
    from_user = Column(Boolean, default=False)
    message = Column(String(8192))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    debug_json = Column(JSON, default={}, nullable=True)
    api_called = Column(Boolean, default=False)
    knowledgebase_called = Column(Boolean, default=False)
    handoff = Column(Boolean, default=False, name="handoff")


class ChatSessions(Base):
    __tablename__ = "session_summary"

    id = Column(Integer, primary_key=True)
    summary = Column(String(8192), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


Base.metadata.create_all(engine)
