from datetime import datetime
from typing import Optional
from shared.models.opencopilot_db import ChatHistory
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.repository.utils import session_manager


class ChatHistoryRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_chat_history(
        self,
        chatbot_id: str,
        session_id: str,
        from_user: bool,
        message: str,
    ) -> ChatHistory:
        async with session_manager(self.session) as session:
            chat_history = ChatHistory(
                chatbot_id=chatbot_id,
                session_id=session_id,
                from_user=from_user,
                message=message,
            )
            session.add(chat_history)
            await session.commit()
            return chat_history

    async def get_all_chat_history_by_session_id_with_total(
        self, session_id: str, limit: int = 20, offset: int = 0
    ):
        async with session_manager(self.session) as session:
            chat_history = (
                await session.execute(
                    select(ChatHistory)
                    .filter_by(session_id=session_id)
                    .order_by(ChatHistory.id.desc())
                    .limit(limit)
                    .offset(offset)
                )
            ).all()
            total_messages = (
                await session.execute(
                    select(func.count(ChatHistory.id)).filter_by(session_id=session_id)
                )
            ).all()

            return chat_history, total_messages

    async def get_all_chat_history(self, limit: int = 10, offset: int = 0):
        async with session_manager(self.session) as session:
            chats = (
                await session.execute(select(ChatHistory).limit(limit).offset(offset))
            ).all()
            return chats

    async def update_chat_history(
        self,
        chat_history_id: str,
        chatbot_id: Optional[str] = None,
        session_id: Optional[str] = None,
        from_user: Optional[str] = None,
        message: Optional[str] = None,
    ) -> ChatHistory:
        async with session_manager(self.session) as session:
            chat_history: ChatHistory = await session.get(ChatHistory, chat_history_id)

            if not chatbot_id:
                chat_history.chatbot_id = chatbot_id
            if session_id:
                chat_history.session_id = session_id
            if from_user:
                chat_history.from_user = from_user
            if message:
                chat_history.message = message

            chat_history.updated_at = datetime.now()

            await session.commit()
            return chat_history

    async def delete_chat_history(self, chat_history_id: str) -> bool:
        async with session_manager(self.session) as session:
            chat_history = await session.get(ChatHistory, chat_history_id)
            if chat_history is None:
                return False
            await session.delete(chat_history)
            await session.commit()
            return True
