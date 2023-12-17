import datetime
import uuid

from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, String, DateTime, Boolean


class FlowVariable(Base):
    __tablename__ = 'flow_variables'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    flow_id = Column(String(36), nullable=False)
    name = Column(String(255))  # email_password
    value = Column(String(255), default=None, nullable=True)  # 123456
    is_runtime_override_magic = Column(Boolean, default=False)  # LLM to magically get it from the user context
    runtime_override_action_id = Column(String(255), default=False, nullable=True)  # In case the variable value will be assigned during the run from previous action response
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)


Base.metadata.create_all(engine)
