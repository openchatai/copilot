from typing import Optional
from shared.models.opencopilot_db.chatbot import ChatbotSettings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.repository.utils import session_manager


class ChatbotSettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_chatbot_setting(self, id: int):
        async with session_manager(self.session) as session:
            return (
                await session.scalars(
                    select(ChatbotSettings).where(ChatbotSettings.id == id)
                )
            ).first()

    async def get_chatbot_settings(self, skip: int = 0, limit: int = 100):
        async with session_manager(self.session) as session:
            return (
                await session.scalars(select(ChatbotSettings).offset(skip).limit(limit))
            ).all()

    async def create_chatbot_setting(
        self, max_pages_to_crawl: int, chatbot_id: str
    ) -> ChatbotSettings:
        async with session_manager(self.session) as session:
            db_chatbot_setting = ChatbotSettings(
                max_pages_to_crawl=max_pages_to_crawl, chatbot_id=chatbot_id
            )
            session.add(db_chatbot_setting)
            await session.commit()
            return db_chatbot_setting

    async def update_chatbot_setting(
        self,
        chatbot_setting_id: int,
        max_pages_to_crawl: Optional[int] = None,
        chatbot_id: Optional[str] = None,
    ) -> Optional[ChatbotSettings]:
        async with session_manager(self.session) as session:
            chatbot_setting = (
                await session.scalars(
                    select(ChatbotSettings).where(
                        ChatbotSettings.id == chatbot_setting_id
                    )
                )
            ).first()
            if chatbot_setting is not None:
                chatbot_setting.max_pages_to_crawl = (
                    max_pages_to_crawl or chatbot_setting.max_pages_to_crawl
                )
                chatbot_setting.chatbot_id = chatbot_id or chatbot_setting.chatbot_id
                await session.commit()
                return chatbot_setting
