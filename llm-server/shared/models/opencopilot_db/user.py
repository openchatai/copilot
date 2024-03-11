# from .database_setup import Base, engine
from shared.models.opencopilot_db.database_setup import Base, engine
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime

from shared.models.opencopilot_db.database_setup import Base, engine
from dataclasses import dataclass


@dataclass
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String(255))
    token = Column(String(255), nullable=True)
    email = Column(String(255), unique=True)
    email_verified_at = Column(DateTime, nullable=True)
    password = Column(String(255))
    remember_token = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "token": self.token,
            "email": self.email,
            "email_verified_at": self.email_verified_at,
            "remember_token": self.remember_token,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    def tokenize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
        }


Base.metadata.create_all(engine)
