import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON

from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Integer


class ChatbotSettings(Base):
    __tablename__ = "chatbot_settings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    max_pages_to_crawl = Column(Integer, default=10)

    # ForeignKey relationship to reference chatbots table
    chatbot_id = Column(String(36))


class Chatbot(Base):
    __tablename__ = "chatbots"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255))
    email = Column(String(255), nullable=True, default="guest")
    token = Column(String(255))
    website = Column(String(255), nullable=True)
    status = Column(String(255), default="draft")
    prompt_message = Column(Text)
    swagger_url = Column(Text)
    enhanced_privacy = Column(Boolean, default=False)
    smart_sync = Column(Boolean, default=False)
    global_variables = Column(JSON, default={}, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(
        DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow
    )
    deleted_at = Column(DateTime, nullable=True)

    summary_prompt = Column(
        Text,
        default=(
            "Given a JSON response, summarize the key information in a concise manner. "
            "Include relevant details, references, and links if present. "
            "Format the summary in Markdown for clarity and readability."
        ),
    )


Base.metadata.create_all(engine)
