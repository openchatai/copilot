from utils.__sql import sql_db
from sqlalchemy import Column, String, DateTime, Boolean
import datetime


class ChatHistory(sql_db.Model):
    __tablename__ = "chat_history"

    id = Column(String(36), primary_key=True)
    chatbot_id = Column(String(36), nullable=True)
    session_id = Column(String(255), nullable=True)
    from_user = Column(Boolean, default=False)
    message = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
