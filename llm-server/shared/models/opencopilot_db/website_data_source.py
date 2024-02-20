from sqlalchemy import Column, String, DateTime
from datetime import datetime
from uuid import uuid4
from shared.models.opencopilot_db.database_setup import Base


class WebsiteDataSource(Base):
    __tablename__ = "website_data_sources"

    id = Column(String(36), primary_key=True, default=uuid4)
    chatbot_id = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, onupdate=datetime.utcnow, nullable=True)
    status = Column(String(255), default="PENDING")
    url = Column(String(255), nullable=False)
    error = Column(String(1024))


# Base.metadata.create_all(async_engine)
