import datetime
import uuid

from opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime


class FlowVariable(Base):
    __tablename__ = 'flow_variables'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_id = Column(String(36), nullable=False)
    chatbot_id = Column(String(36), nullable=False)
    name = Column(String(255))
    value = Column(String(255), default=None, nullable=True)
    runtime_override_key = Column(String(255), default=False,
                                  nullable=True)  # In case the variable value will be assigned during the run
    runtime_override_action_id = Column(String(255), default=False,
                                        nullable=True)  # In case the variable value will be assigned during the run
    status = Column(String(255), default='draft')
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
