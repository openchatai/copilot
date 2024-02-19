import uuid
from typing import Optional, List

from sqlalchemy import select
from shared.models.opencopilot_db import async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from entities.action_entity import ActionDTO
from shared.models.opencopilot_db.action import Action
from models.repository.utils import db_session
from sqlalchemy.ext.asyncio import AsyncSession

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


@db_session
async def create_actions(
    session: AsyncSession, chatbot_id: str, data: List[ActionDTO]
) -> List[Action]:
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
        )
        actions.append(new_action)

    session.add_all(actions)
    await session.commit()
    return actions


@db_session
async def create_action(
    session: AsyncSession, chatbot_id: str, data: ActionDTO
) -> Action:
    new_action = Action(
        id=str(uuid.uuid4()),
        bot_id=chatbot_id,
        name=data.name,
        description=data.description,
        operation_id=data.operation_id,
        api_endpoint=data.api_endpoint,
        request_type=data.request_type,
        payload=data.payload,
    )
    session.add(new_action)
    await session.commit()
    return new_action


@db_session
async def update_action(session: AsyncSession, action_id: str, data: ActionDTO):
    action = (
        await session.scalars(select(Action).where(Action.id == action_id))
    ).first()
    if action is None:
        raise Exception("Action not found")
    # Update fields
    action.name = data.name
    action.description = data.description
    action.operation_id = data.operation_id
    action.base_uri = data.api_endpoint
    action.request_type = data.request_type
    action.payload = data.payload
    await session.commit()
    return action


@db_session
async def list_all_actions(session: AsyncSession, chatbot_id: Optional[str] = None):
    query = select(Action)
    if chatbot_id is not None:
        query = query.where(Action.bot_id == chatbot_id)
    return (await session.scalars(query)).all()


@db_session
async def find_action_by_operation_id(
    session: AsyncSession, operation_id: str
) -> Optional[Action]:
    action = (
        await session.scalars(select(Action).where(Action.operation_id == operation_id))
    ).first()
    return action


@db_session
async def list_all_operation_ids_by_bot_id(
    session: AsyncSession, chatbot_id: Optional[str] = None
) -> List[str]:
    query = select(Action.operation_id)  # Query only the operation_id column
    if chatbot_id is not None:
        query = query.where(Action.bot_id == chatbot_id)
    results = (await session.scalars(query)).all()  # This will be a list of tuples
    # Extract operation_id from each tuple, filter out None and empty strings
    operation_ids = [op_id for op_id in results if op_id]
    return operation_ids


@db_session
async def find_action_by_id(session: AsyncSession, action_id: str) -> Optional[Action]:
    return (await session.scalars(select(Action).where(Action.id == action_id))).first()


@db_session
async def find_action_by_method_id_and_bot_id(
    session: AsyncSession, operation_id: str, bot_id: str
) -> Optional[Action]:
    action = (
        await session.scalars(
            select(Action).where(
                Action.operation_id == operation_id, Action.bot_id == bot_id
            )
        )
    ).first()
    return action


@db_session
async def delete_action_by_id(session: AsyncSession, operation_id: str, bot_id: str):
    action = (
        await session.scalars(
            select(Action).where(
                Action.operation_id == operation_id, Action.bot_id == bot_id
            )
        )
    ).first()
    if action is not None:
        await session.delete(action)
        await session.commit()
        return {"message": "Action deleted successfully"}
    else:
        return {"error": "Action not found"}, 404
