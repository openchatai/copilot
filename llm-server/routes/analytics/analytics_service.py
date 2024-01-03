from sqlalchemy.orm import sessionmaker

from shared.models.opencopilot_db import engine
from shared.models.opencopilot_db.analytics import Analytics
from sqlalchemy.exc import IntegrityError

Session = sessionmaker(bind=engine)
session = Session()


def initialize_analytics(chatbot_id, ref_id):
    """Initialize the analytics entry for a chatbot with initial values."""
    try:
        new_entry = Analytics(chatbot_id=chatbot_id, ref_id=ref_id)
        session.add(new_entry)
        session.commit()

    except IntegrityError as e:
        print(f"Encountered integrity error while creating analytics entry: {str(e)}")
        session.rollback()

    except Exception as e:
        print(f"Encountered unexpected error while creating analytics entry: {str(e)}")
        session.rollback()


def delete_analytics(chatbot_id):
    """Remove analytics data from the database for the given chatbot_id."""
    try:
        query = session.query(Analytics).filter_by(chatbot_id=chatbot_id).one_or_none()

        if query:
            session.delete(query)
            session.commit()

    except IntegrityError as e:
        print(f"Encountered integrity error while deleting analytics entry: {str(e)}")
        session.rollback()

    except Exception as e:
        print(f"Encountered unexpected error while deleting analytics entry: {str(e)}")
        session.rollback()
