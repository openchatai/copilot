from sqlalchemy.ext.asyncio import create_async_engine

from sqlalchemy.pool import QueuePool
from sqlalchemy.ext.declarative import declarative_base  # Import declarative_base
from utils.llm_consts import get_mysql_uri
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import async_sessionmaker


load_dotenv()
# Replace these values with your MySQL server details
db_url = get_mysql_uri()


# Create a function to define the connection creator
def connection_creator():
    return async_engine.connect()


# Create a declarative base instance
Base = declarative_base()

# Create an SQLAlchemy engine with the connection pool
async_engine = create_async_engine(
    db_url,
    poolclass=QueuePool,
    pool_logging_name="worker_pool",
    pool_pre_ping=True,
    pool_recycle=280,
)

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


async def get_db_session():
    async with async_session() as session:
        yield session
