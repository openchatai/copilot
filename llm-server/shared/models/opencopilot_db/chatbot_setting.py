import uuid

from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, BINARY
import datetime


class ChatbotSetting(Base):
    __tablename__ = 'chatbot_settings'

    id = Column(BINARY(16), primary_key=True, default=lambda: uuid.uuid4().bytes)
    chatbot_id = Column(BINARY(16))
    name = Column(String(255))
    value = Column(String(255))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


Base.metadata.create_all(engine)
