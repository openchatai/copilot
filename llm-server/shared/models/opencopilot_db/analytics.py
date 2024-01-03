from sqlalchemy import Column, Integer, String, ForeignKey
from .get_declarative_base import Base
from .database_setup import engine
from .chatbot import Chatbot


class Analytics(Base):
    __tablename__ = "analytics"

    chatbot_id = Column(String(36), primary_key=True)
    actions = Column(Integer)
    knowledgebase = Column(Integer)
    functions = Column(Integer)

    # some key to identify the user
    ref_id = Column(Integer)

    def __init__(self, chatbot_id, knowlegebase, actions, functions):
        self.chatbot_id = chatbot_id
        self.actions = actions
        self.knowledgebase = knowlegebase
        self.functions = functions


Base.metadata.create_all(engine)
