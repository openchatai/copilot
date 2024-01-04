from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import Session
from typing import Optional, Set
from .get_declarative_base import Base
from .database_setup import engine


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(String(36))
    knowledgebase = Column(Integer, default=0)
    chain = Column(Integer, default=0)
    function = Column(Integer, default=0)
    ref_id = Column(Integer)

    @staticmethod
    def increment_counter(
        chatbot_id: str,
        counter_types: Optional[Set[str]] = None,
    ) -> None:
        """Increment the specified counter types for the given chatbot_id."""
        if counter_types is None:
            counter_types = set()

        session = Session(engine)
        try:
            query = (
                session.query(Analytics).filter_by(chatbot_id=chatbot_id).one_or_none()
            )

            if not query:
                query = Analytics(chatbot_id=chatbot_id)

            for counter_type in counter_types:
                setattr(query, counter_type, getattr(query, counter_type, 0) + 1)

            session.merge(query)
            session.commit()

        except Exception as e:
            print(f"Encountered exception while incrementing counters: {str(e)}")
            session.rollback()

        finally:
            session.close()


Base.metadata.create_all(engine)
