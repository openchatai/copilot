from app import db
from sqlalchemy import Column, String, DateTime
import datetime


class ChatHistory(db.Model):
    __tablename__ = "chat_history"

    id = Column(String(36), primary_key=True)
    chatbot_id = Column(String(36), nullable=True)
    session_id = Column(String(255), nullable=True)
    from_user = Column(String(255), db_column="from")
    message = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
