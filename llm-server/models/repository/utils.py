from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError


@asynccontextmanager
async def session_manager(session: AsyncSession):
    try:
        yield session
    except SQLAlchemyError as e:
        print(str(e))  # log the error here
        raise
    finally:
        await session.close()
