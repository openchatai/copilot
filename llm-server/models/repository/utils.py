from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, Session

@asynccontextmanager
async def session_manager(session: AsyncSession):
    try:
        yield session
    except SQLAlchemyError as e:
        print(str(e))  # log the error here
        raise
    finally:
        await session.close()


async_session_maker = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


# Dependency
async def get_db_session() -> Generator:
    session = async_session_maker()
    try:
        yield session
    finally:
        await session.close()
