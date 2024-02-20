from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from datetime import datetime
from uuid import uuid4
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class PdfDataSource(Base):
    __tablename__ = "pdf_data_sources"

    id = Column(String(36), primary_key=True, default=uuid4)
    chatbot_id = Column(String(255), nullable=False)
    file_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    status = Column(String(255), default="success")
