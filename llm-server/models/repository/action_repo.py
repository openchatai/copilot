# action_repo.py
import datetime
import uuid
from typing import Optional, List, Type

from shared.models.opencopilot_db.database_setup import engine
from sqlalchemy.orm import sessionmaker

from entities.action_entity import ActionDTO
from shared.models.opencopilot_db.action import Action
from utils.get_logger import CustomLogger

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)
logger = CustomLogger(module_name=__name__)


def create_actions(chatbot_id: str, data: List[ActionDTO]) -> List[dict]:
    """
    Creates multiple new Action instances and adds them to the database with validations.
    """
    with SessionLocal() as session:
        actions = []
        for dto in data:
            new_action = Action(
                id=str(uuid.uuid4()),
                bot_id=chatbot_id,
                name=dto.name,
                description=dto.description,
                operation_id=dto.operation_id,
                api_endpoint=dto.api_endpoint,
                request_type=dto.request_type,
                payload=dto.payload,
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow(),
            )
            actions.append(new_action)
        try:
            session.add_all(actions)
            session.commit()
            for action in actions:
                session.refresh(action)
            return actions
        except Exception as e:
            session.rollback()
            logger.error("An exception occurred", error=e)
            raise


def create_action(chatbot_id: str, data: ActionDTO) -> dict:
    """
    Creates a new Action instance and adds it to the database with validations.
    """
    with SessionLocal() as session:
        new_action = Action(
            id=str(uuid.uuid4()),
            bot_id=chatbot_id,
            name=data.name,
            description=data.description,
            operation_id=data.operation_id,
            api_endpoint=data.api_endpoint,
            request_type=data.request_type,
            payload=data.payload,
            created_at=datetime.datetime.utcnow(),
            updated_at=datetime.datetime.utcnow(),
        )
        try:
            session.add(new_action)
            session.commit()
            session.refresh(new_action)
            return new_action
        except Exception as e:
            session.rollback()
            logger.error("An exception occurred", error=e)
            raise


def update_action(action_id: str, data: ActionDTO) -> Action:
    """
    Updates an existing Action instance in the database with new data.
    """
    with SessionLocal() as session:
        action = session.query(Action).filter(Action.id == action_id).first()
        if action is None:
            raise ValueError("Action not found")

        # Update fields
        action.name = data.name
        action.description = data.description
        action.operation_id = data.operation_id
        action.api_endpoint = data.api_endpoint
        action.request_type = data.request_type
        action.payload = data.payload
        action.updated_at = datetime.datetime.utcnow()

        try:
            session.commit()
            session.refresh(action)
            return action
        except Exception as e:
            session.rollback()
            logger.error("An exception occurred", error=e)
            raise


def list_all_actions(chatbot_id: Optional[str] = None) -> List[Action]:
    """
    Retrieves actions from the database, optionally filtered by chatbot_id.
    """
    with SessionLocal() as session:
        query = session.query(Action)
        if chatbot_id is not None:
            query = query.filter(Action.bot_id == chatbot_id)
        return query.all()


def find_action_by_operation_id(operation_id: str) -> Optional[Action]:
    """
    Retrieves an action from the database filtered by the given operation_id.
    Returns a single Action object if found, otherwise None.
    """
    with SessionLocal() as session:
        action = (
            session.query(Action).filter(Action.operation_id == operation_id).first()
        )
        return action


def list_all_operation_ids_by_bot_id(chatbot_id: Optional[str] = None) -> List[str]:
    """
    Retrieves a list of operation IDs for actions associated with a specific chatbot,
    filtered by the given chatbot_id. This function excludes null and empty strings
    from the list of operation IDs.
    """
    operation_ids = []
    with SessionLocal() as session:
        query = session.query(Action.operation_id)  # Query only the operation_id column
        if chatbot_id is not None:
            query = query.filter(Action.bot_id == chatbot_id)
        results = query.all()  # This will be a list of tuples

        # Extract operation_id from each tuple, filter out None and empty strings
        operation_ids = [op_id for (op_id,) in results if op_id]

    return operation_ids


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
        "bot_id": action.bot_id,
        "name": action.name,
        "description": action.description,
        "api_endpoint": action.api_endpoint,
        "operation_id": action.operation_id,
        "request_type": action.request_type,
        "payload": action.payload,
        "status": action.status,
        "created_at": action.created_at.isoformat(),
        "updated_at": action.updated_at.isoformat(),
        "deleted_at": action.deleted_at.isoformat() if action.deleted_at else None,
    }


def find_action_by_method_id_and_bot_id(
    operation_id: str, bot_id: str
) -> Optional[Action]:
    """
    Retrieves an action from the database filtered by the given method_id and bot_id.
    Returns a single Action object if found, otherwise None.

    :param method_id: The method ID to filter by.
    :param bot_id: The bot ID to filter by.
    :return: An Action object or None.
    """
    with SessionLocal() as session:
        action = (
            session.query(Action)
            .filter(Action.operation_id == operation_id, Action.bot_id == bot_id)
            .first()
        )
        return action


def delete_action_by_id(operation_id: str, bot_id: str):
    # Find the action to be deleted
    with SessionLocal() as session:
        action = (
            session.query(Action)
            .filter(Action.operation_id == operation_id, Action.bot_id == bot_id)
            .first()
        )

        # Check if action exists
        if action is not None:
            # Delete the action
            session.delete(action)
            session.commit()
            return {"message": "Action deleted successfully"}
        else:
            return {"error": "Action not found"}, 404
