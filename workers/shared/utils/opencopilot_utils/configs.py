import os
from typing import NamedTuple, Optional
from dotenv import load_dotenv

VECTOR_STORE_INDEX_NAME = os.environ.get("VECTOR_STORE_INDEX_NAME", "dummy")
PINECONE_NAMESPACE = "bot-test"
PINECONE_TEXT_KEY = "text"

__all__ = [
    "VECTOR_STORE_INDEX_NAME",
    "PINECONE_NAMESPACE",
    "PINECONE_TEXT_KEY",
]

# 'OPENAI_API_TYPE' and 'STORE'
class ConfigDefaults(NamedTuple):
    CELERY_BACKEND: str
    CELERY_BROKER: str
    LANGCHAIN_TRACING_V2: str
    LOCAL_IP: str
    MONGODB_URL: str
    MYSQL_URI: str
    QDRANT_URL: str
    SELENIUM_GRID_URL: str
    CLAUDE_API_KEY: Optional[str] = None
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_ENDPOINT: Optional[str] = None
    LANGCHAIN_PROJECT: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    OPENAI_API_TYPE: Optional[str] = None
    SHARED_FOLDER: str = "/app/shared_data/"
    STORE: str = "QDRANT"
    SCORE_THRESHOLD_KB: str = "0.75"
    SCORE_THRESHOLD: str = "0.91"


DEV_CONFIG_DEFAULTS = ConfigDefaults(
    CELERY_BACKEND="redis://localhost:6379/1",
    CELERY_BROKER="redis://localhost:6379/0",
    LANGCHAIN_TRACING_V2=False,
    LOCAL_IP="http://localhost",
    MONGODB_URL="mongodb://dbuser:dbpass@localhost:27017",
    MYSQL_URI="mysql+pymysql://dbuser:dbpass@localhost:3307/opencopilot",
    QDRANT_URL="http://localhost:6333",
    SELENIUM_GRID_URL="http://localhost:4444/wd/hub",
    SHARED_FOLDER="/tmp/shared_data/"
)

PROD_CONFIG_DEFAULTS = ConfigDefaults(
    CELERY_BACKEND="redis://redis:6379/1",
    CELERY_BROKER="redis://redis:6379/0",
    LANGCHAIN_TRACING_V2=True,
    LOCAL_IP="http://host.docker.internal",
    MONGODB_URL="mongodb://dbuser:dbpass@mongodb:27017",
    MYSQL_URI="mysql+pymysql://dbuser:dbpass@mysql:3306/opencopilot",
    QDRANT_URL="http://qdrant:6333",
    SELENIUM_GRID_URL="http://selenium:4444/wd/hub",
    SHARED_FOLDER="/app/shared_data/"
)

# Determine environment
IS_PROD = os.getenv("ENVIRONMENT") == "production"

# Select default config
CONFIG_DEFAULTS = PROD_CONFIG_DEFAULTS if IS_PROD else DEV_CONFIG_DEFAULTS

# Read configs from environment variables
ENV_CONFIGS = ConfigDefaults(
    CELERY_BACKEND=os.getenv("CELERY_BACKEND", CONFIG_DEFAULTS.CELERY_BACKEND),
    CELERY_BROKER=os.getenv("CELERY_BROKER", CONFIG_DEFAULTS.CELERY_BROKER),
    MONGODB_URL=os.getenv("MONGODB_URL", CONFIG_DEFAULTS.MONGODB_URL),
    MYSQL_URI=os.getenv("MYSQL_URI", CONFIG_DEFAULTS.MYSQL_URI),
    OPENAI_API_KEY=os.getenv("OPENAI_API_KEY", "ERROR"),
    OPENAI_API_TYPE=os.getenv("OPENAI_API_TYPE", "openai"),
    CLAUDE_API_KEY=os.getenv("CLAUDE_API_KEY", "ERROR"),
    SELENIUM_GRID_URL=os.getenv("SELENIUM_GRID_URL", CONFIG_DEFAULTS.SELENIUM_GRID_URL),
    SHARED_FOLDER=os.getenv("SHARED_FOLDER", CONFIG_DEFAULTS.SHARED_FOLDER),
    QDRANT_URL=os.getenv("QDRANT_URL", CONFIG_DEFAULTS.QDRANT_URL),
    STORE=os.getenv("STORE", CONFIG_DEFAULTS.STORE),
    SCORE_THRESHOLD=os.getenv("SCORE_THRESHOLD", CONFIG_DEFAULTS.SCORE_THRESHOLD),
    LANGCHAIN_ENDPOINT=os.getenv(
        "LANGCHAIN_ENDPOINT", "https://api.smith.langchain.com"
    ),
    LANGCHAIN_API_KEY=os.getenv("LANGCHAIN_API_KEY", "ERROR"),
    LANGCHAIN_PROJECT=os.getenv("LANGCHAIN_PROJECT", "ERROR"),
    LANGCHAIN_TRACING_V2=os.getenv(
        "LANGCHAIN_TRACING_V2", str(CONFIG_DEFAULTS.LANGCHAIN_TRACING_V2)
    ),
    SCORE_THRESHOLD_KB=os.getenv("SCORE_THRESHOLD_KB", CONFIG_DEFAULTS.SCORE_THRESHOLD_KB),
    LOCAL_IP=os.getenv("LOCAL_IP", CONFIG_DEFAULTS.LOCAL_IP)
)
