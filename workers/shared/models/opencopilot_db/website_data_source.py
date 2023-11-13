from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey, ARRAY
from .database_setup import engine
from datetime import datetime
from uuid import uuid4

from .get_declarative_base import Base

class WebsiteDataSource(Base):
    __tablename__ = 'website_data_sources'

    id = Column(String(36), primary_key=True, default=uuid4)
    chatbot_id = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    status = Column(String(255), default='PENDING')
    url = Column(String(255), nullable=False)
    error = Column(String(1024))
    
    
Base.metadata.create_all(engine)