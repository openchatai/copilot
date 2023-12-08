from sqlalchemy import Column, Integer, String, ForeignKey
from .get_declarative_base import Base
from .database_setup import engine
from .chatbot import Chatbot
class Analytics(Base):
    __tablename__ = 'analytics'

    chatbot_id = Column(String(36), primary_key=True)
    successful_operations = Column(Integer)
    total_operations = Column(Integer)
    logs= Column(String(4096), nullable=True)

    def __init__(self, chatbot_id, successful_operations, total_operations, logs=None):
        self.chatbot_id = chatbot_id
        self.successful_operations = successful_operations
        self.total_operations = total_operations
        self.logs = logs
        
Base.metadata.create_all(engine)