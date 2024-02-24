import datetime
import uuid

from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON

from shared.models.opencopilot_db.database_setup import Base
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

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "token": self.token,
            "website": self.website,
            "status": self.status,
            "prompt_message": self.prompt_message,
            "swagger_url": self.swagger_url,
            "enhanced_privacy": self.enhanced_privacy,
            "smart_sync": self.smart_sync,
            "global_variables": self.global_variables,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "deleted_at": self.deleted_at,
        }


# Base.metadata.create_all(engine)
