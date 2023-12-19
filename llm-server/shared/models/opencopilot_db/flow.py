import datetime
import uuid

from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, JSON, Text


class Flow(Base):
    __tablename__ = "flows"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255))
    chatbot_id = Column(String(36), nullable=False)
    payload = Column(JSON, nullable=False, default={})
    description = Column(Text, nullable=True, default=None)
    operation_id = Column(Text, nullable=True, default=None)
    status = Column(String(255), default="draft")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
