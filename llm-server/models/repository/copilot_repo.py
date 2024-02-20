import datetime
import json
import uuid
from typing import Iterable, List, Optional, Any
from flask import jsonify
from sqlalchemy import exc
from sqlalchemy.ext.asyncio import AsyncSession
from copy import deepcopy
from shared.models.opencopilot_db.chatbot import Chatbot
from utils.base import generate_random_token
from utils.get_logger import CustomLogger
from models.repository.utils import session_manager
from sqlalchemy import func
from sqlalchemy import select

logger = CustomLogger(module_name=__name__)


class CopilotRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def list_all_with_filter(
        self, filter_criteria: Optional[Any] = None
    ) -> List[Chatbot]:
        stmt = filter_criteria
        async with session_manager(self.session) as session:
            if filter_criteria is not None:
                query = stmt.filter(filter_criteria)
            results: List[Chatbot] = query.all()
            return results

    async def get_total_chatbots(self):
        async with session_manager(self.session) as session:
            total_chatbots = await session.scalars(func.count(Chatbot.id))
            return total_chatbots

    async def get_chatbots_batch(
        self, offset: int, batch_size: int
    ) -> Iterable[Chatbot]:
        async with session_manager(self.session) as session:
            chatbots_batch = (
                await session.scalars(select(Chatbot).offset(offset).limit(batch_size))
            ).all()
            return chatbots_batch

    async def find_or_fail_by_bot_id(self, bot_id: bytes) -> Optional[Chatbot]:
        async with session_manager(self.session) as session:
            bot: Chatbot = await session.scalar(
                select(Chatbot).where(Chatbot.id == bot_id)
            )
            return bot

    async def create_copilot(
        self,
        name: str,
        prompt_message: str,
        swagger_url: str,
        enhanced_privacy: bool = False,
        smart_sync: bool = False,
        website: Optional[str] = None,
    ):
        async with session_manager(self.session) as session:
            token = generate_random_token(16)
            new_chatbot = Chatbot(
                id=str(uuid.uuid4()),
                name=name,
                token=token,
                website=website,
                prompt_message=prompt_message,
                swagger_url=swagger_url,
                enhanced_privacy=enhanced_privacy,
                smart_sync=smart_sync,
                created_at=datetime.datetime.utcnow(),
                updated_at=datetime.datetime.utcnow(),
            )
            session.add(new_chatbot)
            await session.commit()
            return new_chatbot

    async def find_one_or_fail_by_id(self, bot_id: str):
        async with session_manager(self.session) as session:
            bot: Chatbot = await session.scalar(
                select(Chatbot).where(Chatbot.id == bot_id)
            )
            return bot

    async def find_one_or_fail_by_token(self, bot_token: str) -> Chatbot:
        async with session_manager(self.session) as session:
            bot: Chatbot = await session.scalar(
                select(Chatbot).where(Chatbot.token == bot_token)
            )
            return bot

    async def store_copilot_global_variables(
        self, copilot_id: str, new_variables: dict
    ):
        async with session_manager(self.session) as session:
            chatbot: Chatbot = await session.scalar(
                Chatbot.filter(Chatbot.id == copilot_id)
            )
            existing_variables = deepcopy(dict(chatbot.global_variables or {}))
            existing_variables.update(new_variables)
            chatbot.global_variables = existing_variables
            chatbot.updated_at = datetime.datetime.utcnow()
            await session.commit()

    async def update_copilot(
        self,
        copilot_id: str,
        name: Optional[str] = None,
        prompt_message: Optional[str] = None,
        swagger_url: Optional[str] = None,
        enhanced_privacy: Optional[bool] = None,
        smart_sync: Optional[bool] = None,
        website: Optional[str] = None,
    ):
        async with session_manager(self.session) as session:
            stmt = select(Chatbot).where(Chatbot.id == copilot_id)
            chatbot = await session.scalar(stmt)

            if not chatbot:
                raise ValueError("Chatbot not found")

            if name is not None:
                chatbot.name = name
            if prompt_message is not None:
                chatbot.prompt_message = prompt_message
            if swagger_url is not None:
                chatbot.swagger_url = swagger_url
            if enhanced_privacy is not None:
                chatbot.enhanced_privacy = enhanced_privacy
            if smart_sync is not None:
                chatbot.smart_sync = smart_sync
            if website is not None:
                chatbot.website = website
            chatbot.updated_at = datetime.datetime.utcnow()
            await session.commit()
