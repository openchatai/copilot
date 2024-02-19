from datetime import datetime
from typing import Optional
from shared.models.opencopilot_db import ChatHistory
from sqlalchemy import func
from models.repository.utils import db_session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select


@db_session
async def create_chat_history(
    session: AsyncSession,
    chatbot_id: str,
    session_id: str,
    from_user: bool,
    message: str,
) -> ChatHistory:
    chat_history = ChatHistory(
        chatbot_id=chatbot_id,
        session_id=session_id,
        from_user=from_user,
        message=message,
    )
    session.add(chat_history)
    return chat_history


@db_session
async def get_all_chat_history_by_session_id_with_total(
    session: AsyncSession, session_id: str, limit: int = 20, offset: int = 0
):
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


@db_session
async def get_all_chat_history(session: AsyncSession, limit: int = 10, offset: int = 0):
    chats = (
        await session.execute(select(ChatHistory).limit(limit).offset(offset))
    ).all()
    return chats


@db_session
async def update_chat_history(
    session: AsyncSession,
    chat_history_id: str,
    chatbot_id: Optional[str] = None,
    session_id: Optional[str] = None,
    from_user: Optional[str] = None,
    message: Optional[str] = None,
) -> ChatHistory:
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

    return chat_history


@db_session
async def delete_chat_history(session: AsyncSession, chat_history_id: str) -> bool:
    chat_history = await session.get(ChatHistory, chat_history_id)
    if chat_history is None:
        return False
    await session.delete(chat_history)
    return True
