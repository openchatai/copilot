import datetime

from sqlalchemy import Column, String, DateTime, Boolean, Integer, Enum

from .database_setup import engine
from .get_declarative_base import Base


class LikedStatusEnum(Enum):
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
    liked = Column(
        Enum(LikedStatusEnum),
        default=LikedStatusEnum.no_response,
        server_default=LikedStatusEnum.no_response,
    )  # Added field for liked/disliked/no response with default
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )


Base.metadata.create_all(engine)
