import datetime
import uuid
from typing import Optional, List, cast
from entities.action_entity import ActionDTO
from shared.models.opencopilot_db.action import Action
from utils.get_logger import CustomLogger
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.repository.utils import session_manager

logger = CustomLogger(module_name=__name__)


class ActionRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_actions(
        self, chatbot_id: str, data: List[ActionDTO]
    ) -> List[dict]:
        async with session_manager(self.session) as session:
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
                await session.commit()
                for action in actions:
                    await session.refresh(action)
                return actions
            except Exception as e:
                await session.rollback()
                logger.error("An exception occurred", error=e)
                raise

    async def create_action(self, chatbot_id: str, data: ActionDTO) -> dict:
        async with session_manager(self.session) as session:
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
                await session.commit()
                await session.refresh(new_action)
                return new_action
            except Exception as e:
                await session.rollback()
                logger.error("An exception occurred", error=e)
                raise

    async def update_action(self, action_id: str, data: ActionDTO) -> Action:
        async with session_manager(self.session) as session:
            action = await session.get(Action, action_id)
            if action is None:
                raise ValueError("Action not found")

            # Update fields
            action.name = data.name
            action.description = data.description
            action.operation_id = data.operation_id
            action.base_uri = data.api_endpoint
            action.request_type = data.request_type
            action.payload = data.payload
            action.updated_at = datetime.datetime.utcnow()

            try:
                await session.commit()
                await session.refresh(action)
                return action
            except Exception as e:
                await session.rollback()
                logger.error("An exception occurred", error=e)
                raise

    async def list_all_actions(self, chatbot_id: Optional[str] = None):
        async with session_manager(self.session) as session:
            query = select(Action)
            if chatbot_id is not None:
                query = query.filter(Action.bot_id == chatbot_id)
            results = (await session.execute(query)).scalars().all()
            actions = [row.to_dict() for row in results]
            return actions

    async def find_action_by_operation_id(self, operation_id: str) -> Optional[Action]:
        async with session_manager(self.session) as session:
            action = await session.get(Action, operation_id)
            return action

    async def list_all_operation_ids_by_bot_id(
        self, chatbot_id: Optional[str] = None
    ) -> List[str]:
        operation_ids = []
        async with session_manager(self.session) as session:
            query = select(Action.operation_id)  # Query only the operation_id column
            if chatbot_id is not None:
                query = query.filter(Action.bot_id == chatbot_id)
            results = await session.execute(query)  # This will be a list of tuples

            # Extract operation_id from each tuple, filter out None and empty strings
            operation_ids = [op_id for (op_id,) in results if op_id]

        return operation_ids

    async def find_action_by_id(self, action_id: str) -> Optional[Action]:
        async with session_manager(self.session) as session:
            return await session.get(Action, action_id)

    async def find_action_by_method_id_and_bot_id(
        self, operation_id: str, bot_id: str
    ) -> Optional[Action]:
        async with session_manager(self.session) as session:
            action = await session.scalar(
                select(Action).filter_by(operation_id=operation_id, bot_id=bot_id)
            )
            return action

    async def delete_action_by_id(self, operation_id: str, bot_id: str):
        async with session_manager(self.session) as session:
            action = await session.scalar(
                select(Action).filter_by(operation_id=operation_id, bot_id=bot_id)
            )

            # Check if action exists
            if action is not None:
                # Delete the action
                await session.delete(action)
                await session.commit()
                return {"message": "Action deleted successfully"}
            else:
                return {"error": "Action not found"}, 404



have you not watched it before ? https://youtu.be/JgWJUKzgvR4
it feels like i have never watched this before


https://youtu.be/DJHOLErF8nA