# action_repo.py
import datetime
import uuid
from typing import Optional, List

from opencopilot_db.database_setup import engine
from sqlalchemy.orm import sessionmaker

from shared.models.opencopilot_db.action import Action
from utils.get_logger import CustomLogger

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
logger = CustomLogger(module_name=__name__)


def create_action(chatbot_id: str, name: str, description: str = None, base_uri: str = None, payload: dict = None,
                  status: str = None) -> dict:
    """
    Creates a new Action instance and adds it to the database with validations.
    """
    # Explicit Validations
    if not chatbot_id or not isinstance(chatbot_id, str):
        raise ValueError("Invalid chatbot_id provided")
    if not name or not isinstance(name, str):
        raise ValueError("Invalid name provided")
    # Add other necessary validations as needed

    with SessionLocal() as session:
        new_action = Action(
            id=str(uuid.uuid4()),
            chatbot_id=chatbot_id,
            name=name,
            description=description,
            base_uri=base_uri,
            payload=payload,
            status=status,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow(),
        )
        try:
            session.add(new_action)
            session.commit()
            return action_to_dict(new_action)
        except Exception as e:
            session.rollback()
            logger.error("An exception occurred", error=str(e))
            raise


def list_all_actions(chatbot_id: Optional[str] = None) -> List[Action]:
    """
    Retrieves actions from the database, optionally filtered by chatbot_id.
    """
    with SessionLocal() as session:
        query = session.query(Action)
        if chatbot_id is not None:
            query = query.filter(Action.chatbot_id == chatbot_id)
        return query.all()


def find_action_by_id(action_id: str) -> Optional[Action]:
    """
    Finds an Action instance by its ID.
    """
    with SessionLocal() as session:
        return session.query(Action).filter(Action.id == action_id).first()


def action_to_dict(action: Action) -> dict:
    """
    Converts an Action object to a dictionary.
    """
    return {
        "id": action.id,
        "chatbot_id": action.chatbot_id,
        "name": action.name,
        "description": action.description,
        "base_uri": action.base_uri,
        "payload": action.payload,
        "status": action.status,
        "created_at": action.created_at.isoformat(),
        "updated_at": action.updated_at.isoformat(),
        "deleted_at": action.deleted_at.isoformat() if action.deleted_at else None,
    }
