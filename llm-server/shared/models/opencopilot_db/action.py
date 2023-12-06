import datetime
import uuid

from opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, JSON, Text


class Action(Base):
    __tablename__ = 'actions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chatbot_id = Column(String(36), nullable=False)
    name = Column(String(255), nullable=True, default="")
    description = Column(Text, nullable=True, default="")
    base_uri = Column(String(255), nullable=True, default="")
    payload = Column(JSON, nullable=False, default={})  # Swagger path
    status = Column(String(255), default='live')  # live, draft
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
