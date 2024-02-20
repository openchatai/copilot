import datetime
import uuid
from typing import Iterable, List, Optional, Any
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

    async def list_all_with_filter(self, filter_criteria: Optional[Any] = None):
        async with self.session as session:
            if filter_criteria is not None:
                results = (
                    (await session.execute(select(Chatbot).filter(filter_criteria)))
                    .scalars()
                    .all()
                )
            else:
                results = (await session.execute(select(Chatbot))).scalars().all()
            return results

    async def get_total_chatbots(self) -> int:
        async with self.session as session:
            total_chatbots = await session.execute(func.count(Chatbot.id))
            return total_chatbots.scalar_one()

    async def get_chatbots_batch(
        self, offset: int, batch_size: int
    ) -> Iterable[Chatbot]:
        async with self.session as session:
            chatbots_batch: Iterable[Chatbot] = (
                (
                    await session.execute(
                        select(Chatbot).offset(offset).limit(batch_size)
                    )
                )
                .scalars()
                .all()
            )
            return chatbots_batch

    async def find_or_fail_by_bot_id(self, bot_id: bytes) -> Optional[Chatbot]:
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.id == bot_id)
            result = await session.execute(stmt)
            bot: Optional[Chatbot] = result.scalar_one_or_none()
            return bot

    async def create_copilot(
        self,
        name: str,
        prompt_message: str,
        swagger_url: str,
        enhanced_privacy: bool = False,
        smart_sync: bool = False,
        website: Optional[str] = None,
    ) -> Chatbot:
        async with self.session as session:
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
            await session.refresh(new_chatbot)
            return new_chatbot

    async def find_one_or_fail_by_id(self, bot_id: str) -> Chatbot:
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.id == bot_id)
            result = await session.execute(stmt)
            bot: Chatbot = result.scalar_one_or_none()
            if bot is None:
                raise ValueError(f"No Chatbot found with id: {bot_id}")
            return bot

    async def find_one_or_fail_by_token(self, bot_token: str) -> Chatbot:
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.token == bot_token)
            result = await session.execute(stmt)
            bot: Chatbot = result.scalar_one_or_none()
            if bot is None:
                raise ValueError(f"No Chatbot found with token: {bot_token}")
            return bot

    async def store_copilot_global_variables(
        self, copilot_id: str, new_variables: dict
    ):
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.id == copilot_id)
            result = await session.execute(stmt)
            chatbot: Chatbot = result.scalar_one_or_none()
            if chatbot is None:
                raise ValueError(f"No Chatbot found with id: {copilot_id}")

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
    ) -> Chatbot:
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.id == copilot_id)
            result = await session.execute(stmt)
            chatbot: Chatbot = result.scalar_one_or_none()

            if chatbot is None:
                raise ValueError(f"No Chatbot found with id: {copilot_id}")

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
            await session.refresh(chatbot)
            return chatbot

    async def delete_copilot_global_key(self, copilot_id: str, variable_key: str):
        async with self.session as session:
            stmt = select(Chatbot).where(Chatbot.id == copilot_id)
            result = await session.execute(stmt)
            copilot: Chatbot = result.scalar_one_or_none()

            if copilot is None:
                raise ValueError(f"No Chatbot found with id: {copilot_id}")

            vars_dict = deepcopy(dict(copilot.global_variables))

            if variable_key in vars_dict:
                del vars_dict[variable_key]
                copilot.global_variables = vars_dict
                await session.commit()
                await session.refresh(copilot)
