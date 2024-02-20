from shared.models.opencopilot_db.api_call import APICall
from models.repository.utils import session_manager
from sqlalchemy.ext.asyncio import AsyncSession


class APICallRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_api_call(
        self,
        url: str,
        path: str,
        method: str,
        path_params: str = "",
        query_params: str = "",
    ):
        async with session_manager(self.session) as session:
            api_call = APICall(
                url=url,
                path=path,
                method=method,
                path_params=path_params,
                query_params=query_params,
            )
            session.add(api_call)
            await session.commit()
