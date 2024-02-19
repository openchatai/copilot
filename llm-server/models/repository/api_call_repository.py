from shared.models.opencopilot_db.api_call import APICall
from models.repository.utils import db_session
from sqlalchemy.ext.asyncio import AsyncSession


class APICallRepository:
    @db_session
    async def log_api_call(
        self,
        session: AsyncSession,
        url: str,
        path: str,
        method: str,
        path_params: str = "",
        query_params: str = "",
    ):
        api_call = APICall(
            url=url,
            path=path,
            method=method,
            path_params=path_params,
            query_params=query_params,
        )
        session.add(api_call)
        await session.commit()
