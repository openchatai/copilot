import datetime
import uuid
from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, JSON, Text
from dataclasses import dataclass
from sqlalchemy import ForeignKey
from enum import Enum
from sqlalchemy.orm import Session
from typing import List


@dataclass
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


@dataclass
class ActionCall(Base):
    __tablename__ = "action_calls"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    operation_id = Column(String(36), nullable=False)
    session_id = Column(String(36), nullable=False)
    chatbot_id = Column(String(36), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    success = Column(String(36), nullable=True, default=None)


Base.metadata.create_all(engine)
