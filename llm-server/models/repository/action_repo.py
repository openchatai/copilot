# action_repo.py
import datetime
import uuid
from typing import Optional, List, Type

from sqlalchemy import exc
from sqlalchemy.orm import sessionmaker, Session
from opencopilot_db.database_setup import engine

from shared.models.opencopilot_db.actions import Action
from utils.get_logger import CustomLogger

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
logger = CustomLogger(module_name=__name__)


def create_action(name: str, description: str, payload: dict, status: str) -> dict:
    """
    Creates a new Action instance and adds it to the database.
    """
    with SessionLocal() as session:
        new_action = Action(
            id=str(uuid.uuid4()),
            name=name,
            description=description,
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


def list_all_actions() -> list[Type[Action]]:
    """
    Retrieves all actions from the database.
    """
    with SessionLocal() as session:
        return session.query(Action).all()


def find_action_by_id(action_id: str) -> Optional[Action]:
    """
    Finds an Action instance by its ID.
    """
    with SessionLocal() as session:
        return session.query(Action).filter(Action.id == action_id).first()


# Additional functions like update_action, delete_action, etc., can be added as needed

def action_to_dict(action: Action) -> dict:
    """
    Converts an Action object to a dictionary.
    """
    return {
        "id": action.id,
        "name": action.name,
        "description": action.description,
        "payload": action.payload,
        "status": action.status,
        "created_at": action.created_at.isoformat(),
        "updated_at": action.updated_at.isoformat(),
        "deleted_at": action.deleted_at.isoformat() if action.deleted_at else None,
    }
