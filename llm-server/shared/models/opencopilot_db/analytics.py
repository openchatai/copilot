from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Analytics(Base):
    __tablename__ = 'analytics'

    chatbot_id = Column(String, primary_key=True)
    successful_operations = Column(Integer)
    total_operations = Column(Integer)
    user_id = Column(String)

    def __init__(self, chatbot_id, user_id):
        self.chatbot_id = chatbot_id
        self.user_id = user_id