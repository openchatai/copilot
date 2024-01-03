from .database_setup import engine
import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum

from .get_declarative_base import Base


class LikedStatusEnum(str, Enum):
    liked = "liked"
    disliked = "disliked"
    no_response = "no_response"


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(String(36), nullable=True)
    session_id = Column(String(255), nullable=True)
    from_user = Column(Boolean, default=False)
    message = Column(String(8192))
    # liked = Column(String(10))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


Base.metadata.create_all(engine)
