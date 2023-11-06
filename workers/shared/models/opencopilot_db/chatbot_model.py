from sqlalchemy import Column, String, Boolean, DateTime, Text
from datetime import datetime
import uuid
from .get_declarative_base import Base
from .database_setup import engine
class Chatbot(Base):
    __tablename__ = 'chatbots'

    id = Column(String(36), primary_key=True, default=str(uuid.uuid4()))
    name = Column(String(255), default="My first chatbot")
    website = Column(String(255), default="https://openchat.so")
    status = Column(String(255))  # Assuming ChatbotStatusType is a string-based enum
    prompt_message = Column(Text, nullable=True, default="AI_ASSISTANT_INITIAL_PROMPT")  # Assuming it's a string value
    token = Column(String(255))

    enhanced_privacy = Column(Boolean, default=False)
    smart_sync = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

Base.metadata.create_all(engine)