from shared.models.opencopilot_db import PdfDataSource, WebsiteDataSource
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.repository.utils import session_manager


class FlowRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_all_pdf_datasource_by_bot_id(
        self, bot_id: str, limit: int = 20, offset: int = 0
    ):
        async with session_manager(self.session) as session:
            datasources = (
                await session.scalars(
                    select(PdfDataSource)
                    .where(PdfDataSource.chatbot_id == bot_id)
                    .order_by(PdfDataSource.created_at.desc())
                    .limit(limit)
                    .offset(offset)
                )
            ).all()

        return datasources

    async def get_all_website_datasource_by_bot_id(
        self, bot_id: str, limit: int = 20, offset: int = 0
    ):
        async with session_manager(self.session) as session:
            datasources = (
                await session.scalars(
                    select(WebsiteDataSource)
                    .where(WebsiteDataSource.chatbot_id == bot_id)
                    .order_by(WebsiteDataSource.created_at.desc())
                    .limit(limit)
                    .offset(offset)
                )
            ).all()

        return datasources
