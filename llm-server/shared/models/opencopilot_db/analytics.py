from sqlalchemy import Column, Integer, String, ForeignKey
from .get_declarative_base import Base
from .database_setup import engine


# Analytics.increment_counter(session, chatbot_id, "functions")
class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True)
    chatbot_id = Column(String(36))
    knowledgebase = Column(Integer, default=0)
    actions = Column(Integer, default=0)
    functions = Column(Integer, default=0)
    ref_id = Column(Integer)

    @staticmethod
    def increment_counter(session, chatbot_id, counter_type):
        """Increment the specified counter type ('knowledgebase', 'actions', or 'functions') for the given chatbot_id."""
        try:
            query = (
                session.query(Analytics).filter_by(chatbot_id=chatbot_id).one_or_none()
            )

            if not query:
                query = Analytics(chatbot_id=chatbot_id)

            setattr(query, counter_type, getattr(query, counter_type) + 1)
            session.merge(query)
            session.commit()

        except Exception as e:
            print(f"Encountered exception while incrementing counter: {str(e)}")
            session.rollback()


Base.metadata.create_all(engine)
