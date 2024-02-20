from models.repository.utils import session_manager
from shared.models.opencopilot_db.action import Action, ActionCall
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func
from sqlalchemy import select


class ActionCallRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_action_call(
        self, operation_id: str, session_id: str, bot_id: str
    ) -> Action:
        action_call = ActionCall(
            operation_id=operation_id,
            session_id=session_id,
            chatbot_id=bot_id,
        )
        async with session_manager(self.session) as session:
            session.add(action_call)
            await session.commit()
            return action_call

    async def get_action_call_by_id(self, action_id: str):
        async with session_manager(self.session) as session:
            return (
                await session.scalars(select(Action).where(Action.id == action_id))
            ).first()

    async def get_actions_by_chatbot_id(self, chatbot_id: str):
        async with session_manager(self.session) as session:
            return (
                await session.scalars(select(Action).where(Action.bot_id == chatbot_id))
            ).all()

    async def count_action_id_for_bot_id(self, bot_id: str):
        async with session_manager(self.session) as session:
            return await session.scalars(
                func.count(Action.id).where(Action.bot_id == bot_id)
            )

    async def count_action_id_for_session_id(self, session_id: str):
        async with session_manager(self.session) as session:
            return await session.scalars(
                func.count(Action.id).where(Action.session_id == session_id)
            )
