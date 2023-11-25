import uuid

from opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text, UUID, BINARY
import datetime


class Chatbot(Base):
    __tablename__ = 'chatbots'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255))
    token = Column(String(255))
    website = Column(String(255), nullable=True)
    status = Column(String(255), default='draft')
    prompt_message = Column(Text)
    swagger_url = Column(Text)
    enhanced_privacy = Column(Boolean, default=False)
    smart_sync = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
