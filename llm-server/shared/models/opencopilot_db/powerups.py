from sqlalchemy import Boolean, Column, String, Text
from shared.models.opencopilot_db.database_setup import Base, engine

from sqlalchemy import Integer


class PowerUp(Base):
    __tablename__ = "powerups"

    id = Column(Integer, primary_key=True, autoincrement=True)
    chatbot_id = Column(String(36), nullable=False)
    name = Column(String(255), nullable=False)
    base_prompt = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    conditional = Column(Boolean, default=False, nullable=False)
    path = Column(String(255), nullable=True)
