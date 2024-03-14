from sqlalchemy import Column, String, Integer, JSON

from .database_setup import engine
from .get_declarative_base import Base
from dataclasses import dataclass


@dataclass
class ChatIntents(Base):
    __tablename__ = "chat_intents"

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(255), nullable=True)
    intents = Column(JSON, default={})


Base.metadata.create_all(engine)
