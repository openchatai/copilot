import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON

from .database_setup import engine
from .get_declarative_base import Base
from dataclasses import dataclass
from sqlalchemy import Index


@dataclass
class ChatHistory(Base):
    __tablename__ = "chat_history"
    __table_args__ = (
        Index("idx_chatbot_id", "chatbot_id"),
        Index("idx_session_id", "session_id"),
        Index("idx_created_at", "created_at"),
        Index("idx_updated_at", "updated_at"),
        Index("idx_chatbot_created", "chatbot_id", "created_at"),
        Index("idx_session_created", "session_id", "created_at"),
    )

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


class ChatSessions(Base):
    __tablename__ = "session_summary"

    id = Column(Integer, primary_key=True)
    summary = Column(String(8192), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


Base.metadata.create_all(engine)
