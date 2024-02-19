from typing import Any, Callable
from shared.models.opencopilot_db import async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


def db_session(coro: Callable[..., Any]) -> Callable[..., Any]:
    async def wrapper(*args, **kwargs):
        try:
            async with async_session() as session:
                return await coro(session, *args, **kwargs)
        except (
            Exception
        ) as e:  # SQLAlchemyError or whatever exception you want to catch
            print(f"An error occurred: {str(e)}")
            return None

    return wrapper
