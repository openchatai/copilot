import datetime
import uuid
from shared.models.opencopilot_db.database_setup import Base
from sqlalchemy import Column, String, DateTime, JSON, Text
from dataclasses import dataclass


class Action(Base):
    __tablename__ = "actions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    bot_id = Column(String(36), nullable=False)
    name = Column(String(255), nullable=True, default="")
    description = Column(Text, nullable=True, default="")
    api_endpoint = Column(String(255), nullable=True, default="")
    request_type = Column(String(255), nullable=True, default="")  # GET, POST, etc...
    operation_id = Column(String(255), nullable=True, default="")  # auto generated
    payload = Column(JSON, nullable=False, default={})  # The request stuff
    status = Column(String(255), default="live")  # live, draft
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    deleted_at = Column(DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "bot_id": self.bot_id,
            "name": self.name,
            "description": self.description,
            "api_endpoint": self.api_endpoint,
            "operation_id": self.operation_id,
            "request_type": self.request_type,
            "payload": self.payload,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
        }


@dataclass
class ActionCall(Base):
    __tablename__ = "action_calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    operation_id = Column(String(36), nullable=False)
    session_id = Column(String(36), nullable=False)
    chatbot_id = Column(String(36), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    success = Column(String(36), nullable=True, default=None)


# Base.metadata.create_all(engine)
