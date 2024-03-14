from shared.models.opencopilot_db import engine, ChatIntents
from sqlalchemy.orm import sessionmaker

# Define a session factory
Session = sessionmaker(bind=engine)
session = Session()


def create_chat_intent(session_id: str, intents: dict):
    """
    Create a new ChatIntents record in the database.

    Parameters:
    - session_id: Unique identifier for the chat session.
    - intents: Dictionary containing chat intents.

    Returns:
    - ChatIntents object.
    """
    chat_intent = ChatIntents(session_id=session_id, intents=intents)
    session.add(chat_intent)
    session.commit()
    return chat_intent


def get_chat_intent_by_session_id(session_id: str):
    """
    Retrieve a ChatIntents record by session_id.

    Parameters:
    - session_id: Unique identifier for the chat session.

    Returns:
    - ChatIntents object or None if not found.
    """
    return session.query(ChatIntents).filter_by(session_id=session_id).first()
