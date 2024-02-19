from typing import List, Type, Optional
from shared.models.opencopilot_db import async_engine
from shared.models.opencopilot_db.chatbot import ChatbotSettings
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker
from sqlalchemy import select
from models.repository.utils import db_session

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


@db_session
async def get_chatbot_setting(session: AsyncSession, id: int):
    return (
        await session.scalars(select(ChatbotSettings).where(ChatbotSettings.id == id))
    ).first()


@db_session
async def get_chatbot_settings(session: AsyncSession, skip: int = 0, limit: int = 100):
    return (
        await session.scalars(select(ChatbotSettings).offset(skip).limit(limit))
    ).all()


@db_session
async def create_chatbot_setting(
    session: AsyncSession, max_pages_to_crawl: int, chatbot_id: str
) -> ChatbotSettings:
    db_chatbot_setting = ChatbotSettings(
        max_pages_to_crawl=max_pages_to_crawl, chatbot_id=chatbot_id
    )
    session.add(db_chatbot_setting)
    await session.commit()
    return db_chatbot_setting


@db_session
async def update_chatbot_setting(
    session: AsyncSession,
    chatbot_setting_id: int,
    max_pages_to_crawl: Optional[int] = None,
    chatbot_id: Optional[str] = None,
) -> Optional[ChatbotSettings]:
    chatbot_setting = (
        await session.scalars(
            select(ChatbotSettings).where(ChatbotSettings.id == chatbot_setting_id)
        )
    ).first()
    if chatbot_setting is not None:
        chatbot_setting.max_pages_to_crawl = (
            max_pages_to_crawl or chatbot_setting.max_pages_to_crawl
        )
        chatbot_setting.chatbot_id = chatbot_id or chatbot_setting.chatbot_id
        await session.commit()
        return chatbot_setting
