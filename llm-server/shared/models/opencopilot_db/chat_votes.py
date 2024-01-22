import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Integer, JSON

from .database_setup import engine
from .get_declarative_base import Base

class ChatVote(Base):
    __tablename__ = "chat_votes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(String(36), nullable=True)
    message_id = Column(String(255), nullable=True)
    is_upvote = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )




Base.metadata.create_all(engine)

