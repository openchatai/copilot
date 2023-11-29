import datetime
import uuid
from typing import List, Optional, Any, Type

from opencopilot_db.chatbot import Chatbot, engine
from sqlalchemy import exc
from sqlalchemy.orm import sessionmaker, Session

from utils import struct_log
from utils.base import generate_random_token

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
        raise
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


def create_copilot(
    name: str,
    prompt_message: str,
    swagger_url: str,
    enhanced_privacy: bool = False,
    smart_sync: bool = False,
    website: Optional[str] = None,
):
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
    with SessionLocal() as session:
        token = generate_random_token(16)

        new_chatbot = Chatbot(
            id=str(uuid.uuid4()),
            name=name,
            token=token,
            website=website,
            prompt_message=prompt_message,
            swagger_url=swagger_url,
            enhanced_privacy=enhanced_privacy,
            smart_sync=smart_sync,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow(),
            email='example@example.com',
        )

        try:
            session.add(new_chatbot)
            session.commit()
            return chatbot_to_dict(new_chatbot)
        except Exception as e:
            session.rollback()
            struct_log.exception(app="OPENCOPILOT", error=str(e), event="/swagger")
            raise e
        finally:
            session.close()


def find_one_or_fail_by_id(bot_id: str) -> Chatbot:
    """
    Finds a Chatbot instance by its ID. Raises an exception if the Chatbot is not found.

    Args:
        bot_id (str): The unique identifier of the Chatbot.

    Returns:
        Chatbot: The found Chatbot instance.

    Raises:
        ValueError: If no Chatbot is found with the provided ID.
        Exception: If any other exception occurs during the database operation.
    """
    session: Session = SessionLocal()
    try:
        bot = session.query(Chatbot).filter(Chatbot.id == str(bot_id)).one()
        return bot
    except exc.NoResultFound:
        raise ValueError(f"No Chatbot found with id: {bot_id}")
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


def find_one_or_fail_by_token(bot_token: str) -> Chatbot:
    """
    Finds a Chatbot instance by its ID. Raises an exception if the Chatbot is not found.

    Args:
        bot_token: The unique identifier of the Chatbot.

    Returns:
        Chatbot: The found Chatbot instance.

    Raises:
        ValueError: If no Chatbot is found with the provided ID.
        Exception: If any other exception occurs during the database operation.
    """
    session: Session = SessionLocal()
    try:
        bot = session.query(Chatbot).filter(Chatbot.token == str(bot_token)).one()
        return bot
    except exc.NoResultFound:
        raise ValueError(f"No Chatbot found with token: {bot_token}")
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()


# Todo: move it to the model once we extract it from the module
def chatbot_to_dict(chatbot: Chatbot):
    """Convert a Chatbot object to a dictionary."""

    return {
        "id": chatbot.id.hex() if isinstance(chatbot.id, bytes) else chatbot.id,
        # Converts binary to hex string if id is binary
        "name": chatbot.name,
        "token": chatbot.token,
        "website": chatbot.website,
        "status": chatbot.status,
        "prompt_message": chatbot.prompt_message,
        "enhanced_privacy": chatbot.enhanced_privacy,
        "smart_sync": chatbot.smart_sync,
        "created_at": chatbot.created_at.isoformat() if chatbot.created_at else None,
        # Converts datetime to ISO format string
        "updated_at": chatbot.updated_at.isoformat() if chatbot.updated_at else None,
        # Converts datetime to ISO format string
        "deleted_at": chatbot.deleted_at.isoformat() if chatbot.deleted_at else None,
        # Converts datetime to ISO format string
        "swagger_url": chatbot.swagger_url,
    }


def update_copilot(
    copilot_id: str,
    name: Optional[str] = None,
    prompt_message: Optional[str] = None,
    swagger_url: Optional[str] = None,
    enhanced_privacy: Optional[bool] = None,
    smart_sync: Optional[bool] = None,
    website: Optional[str] = None,
) -> dict[str, Any]:
    """
    Updates an existing Chatbot instance in the database.

    Args:
        copilot_id (str): The ID of the Chatbot to update.
        name (Optional[str]): New name for the chatbot, if provided.
        website (Optional[str]): New website URL for the chatbot, if provided.
        prompt_message (Optional[str]): New default prompt message for the chatbot, if provided.
        swagger_url (Optional[str]): New URL for the chatbot's Swagger documentation, if provided.
        enhanced_privacy (Optional[bool]): New flag to indicate enhanced privacy, if provided.
        smart_sync (Optional[bool]): New flag for smart synchronization, if provided.

    Returns:
        dict[str, Any]: The updated Chatbot instance.

    Raises:
        ValueError: If the Chatbot with the given ID is not found.
        Exception: If any exception occurs during the database operation.
    """
    session: Session = SessionLocal()

    try:
        # Fetch the existing Chatbot
        chatbot = session.query(Chatbot).filter(Chatbot.id == copilot_id).one()

        # Update fields if new values are provided
        if name is not None:
            chatbot.name = name
        if prompt_message is not None:
            chatbot.prompt_message = prompt_message
        if swagger_url is not None:
            chatbot.swagger_url = swagger_url
        if enhanced_privacy is not None:
            chatbot.enhanced_privacy = enhanced_privacy
        if smart_sync is not None:
            chatbot.smart_sync = smart_sync
        if website is not None:
            chatbot.website = website

        chatbot.updated_at = datetime.datetime.utcnow()

        session.commit()
        return chatbot_to_dict(chatbot)
    except exc.NoResultFound:
        session.rollback()
        raise ValueError(f"No Chatbot found with id: {copilot_id}")
    except Exception as e:
        session.rollback()
        struct_log.exception(app="OPENCOPILOT", error=str(e), event="update_copilot")
    finally:
        session.close()
