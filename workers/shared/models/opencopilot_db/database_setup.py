from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool
from sqlalchemy.ext.declarative import declarative_base  # Import declarative_base
import os
from shared.utils.opencopilot_utils import ENV_CONFIGS

# Replace these values with your MySQL server details
db_url = ENV_CONFIGS.MYSQL_URI

# Create a function to define the connection creator
def connection_creator():
    return engine.connect()

# Create a declarative base instance
Base = declarative_base()

# Create an SQLAlchemy engine with the connection pool
engine = create_engine(db_url, poolclass=QueuePool, pool_logging_name="worker_pool")

pool = QueuePool(creator=connection_creator, pool_size=5)

def create_database_schema():
    Base.metadata.create_all(engine)