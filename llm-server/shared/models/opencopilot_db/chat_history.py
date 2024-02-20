import datetime
from shared.models.opencopilot_db.database_setup import async_engine, Base
from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON

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


Base.metadata.create_all(async_engine)
