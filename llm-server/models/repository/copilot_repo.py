import datetime
import uuid
from typing import List, Optional, Any

from opencopilot_db.chatbot import Chatbot, engine
from sqlalchemy import exc
from sqlalchemy.orm import sessionmaker, Session

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)


def list_all_with_filter(filter_criteria: Optional[Any] = None) -> List[Chatbot]:
    """
    Retrieves a list of Chatbot instances from the database that match the given filter criteria.

    Args:
        filter_criteria (Any): A SQLAlchemy filter criterion. This could be a condition or a combination of conditions
                                using SQLAlchemy's filter expressions.

    Returns:
        List[Chatbot]: A list of Chatbot instances that match the filter criteria.

    Raises:
        Exception: If any exception occurs during the database operation.

    Usage:
        To use this function, you need to pass a valid SQLAlchemy filter expression as the filter_criteria.
        For example, to get all chatbots with a specific name:

        chatbots = list_all_with_filter(Chatbot.name == 'desired_name')
    """
    session: Session = SessionLocal()
    try:
        query = session.query(Chatbot)
        if filter_criteria is not None:
            query = query.filter(filter_criteria)
        results: List[Chatbot] = query.all()
        return results
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        session.close()


def find_or_fail_by_bot_id(bot_id: bytes) -> Optional[Chatbot]:
    session: Session = SessionLocal()
    try:
        bot: Chatbot = session.query(Chatbot).filter(Chatbot.id == bot_id).one()
        return bot
    except exc.NoResultFound:
        raise ValueError(f"No Chatbot found with id: {bot_id}")
    except Exception as e:
        print(f"Error occurred: {e}")
    finally:
        session.close()


def create_copilot(name: str,
                   prompt_message: str, swagger_url: str,
                   enhanced_privacy: bool = False, smart_sync: bool = False,
                   website: Optional[str] = None, ) -> Chatbot:
    """
    Creates a new Chatbot instance and adds it to the database.

    Args:
        name (str): Name of the chatbot.
        website (Optional[str]): Website URL for the chatbot, optional.
        prompt_message (str): Default prompt message for the chatbot.
        swagger_url (str): URL for the chatbot's Swagger documentation.
        enhanced_privacy (bool): Flag to indicate enhanced privacy, defaults to False.
        smart_sync (bool): Flag for smart synchronization, defaults to False.

    Returns:
        Chatbot: The newly created Chatbot instance.

    Raises:
        Exception: If any exception occurs during the database operation.
    """
    session: Session = SessionLocal()
    token = 'random' #todo random generation
    new_chatbot = Chatbot(
        id=uuid.uuid4().bytes,
        name=name,
        token=token,
        website=website,
        prompt_message=prompt_message,
        swagger_url=swagger_url,
        enhanced_privacy=enhanced_privacy,
        smart_sync=smart_sync,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )

    try:
        session.add(new_chatbot)
        session.commit()
        return new_chatbot
    except Exception as e:
        session.rollback()
        print(f"Error occurred: {e}")
    finally:
        session.close()


def find_one_or_fail_by_id(bot_id: bytes) -> Chatbot:
    """
    Finds a Chatbot instance by its ID. Raises an exception if the Chatbot is not found.

    Args:
        bot_id (bytes): The unique identifier of the Chatbot.

    Returns:
        Chatbot: The found Chatbot instance.

    Raises:
        ValueError: If no Chatbot is found with the provided ID.
        Exception: If any other exception occurs during the database operation.
    """
    session: Session = SessionLocal()
    try:
        bot = session.query(Chatbot).filter(Chatbot.id == bot_id).one()
        return bot
    except exc.NoResultFound:
        raise ValueError(f"No Chatbot found with id: {bot_id}")
    except Exception as e:
        session.rollback()
        print(f"Error occurred: {e}")
    finally:
        session.close()
