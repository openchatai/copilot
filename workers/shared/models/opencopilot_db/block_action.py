import datetime
import uuid

from opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, Integer, JSON


class BlockAction(Base):
    __tablename__ = 'block_actions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255))
    chatbot_id = Column(String(36), nullable=False)
    flow_id = Column(String(36), nullable=False)
    flow_block_id = Column(String(36), nullable=False)
    type = Column(String(255), default='api')
    swagger_endpoint = Column(JSON(), default=None)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
