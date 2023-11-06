from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

from .get_declarative_base import Base

class PdfDataSource(Base):
    __tablename__ = 'pdf_data_sources'

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(Integer, ForeignKey('chatbots.id'), nullable=True)
    files = Column(JSON)
    files_info = Column(JSON, nullable=True)
    folder_name = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    ingest_status = Column(String(255), default='success')
