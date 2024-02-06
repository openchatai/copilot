from flask import Request
import os

from typing import TypedDict
from functools import lru_cache

from qdrant_client import QdrantClient
from urllib.parse import urlparse

X_CONSUMER_USERNAME = "X-CONSUMER-USERNAME"
EXPERIMENTAL_FEATURES_ENABLED = os.getenv("EXPERIMENTAL_FEATURES_ENABLED", "NO")


def get_username_from_request(request: Request):
    return request.headers.get(X_CONSUMER_USERNAME) or "guest@opencopilot.so"


SYSTEM_MESSAGE_PROMPT = "system_message_prompt"
SUMMARIZATION_PROMPT = "summarization_prompt"
X_App_Name = "X-App-Name"
SHARED_FOLDER = os.getenv("SHARED_FOLDER", "/app/shared_data")


class VsThresholds(TypedDict):
    actions_score_threshold: float
    flows_score_threshold: float
    kb_score_threshold: float


vs_thresholds: VsThresholds = {
    "actions_score_threshold": float(os.getenv("ACTIONS_SCORE_THRESHOLD", "0.25")),
    "flows_score_threshold": float(os.getenv("FLOWS_SCORE_THRESHOLD", "0.75")),
    "kb_score_threshold": float(os.getenv("KB_SCORE_THRESHOLD", "0.55")),
}

model_env_var = "CHAT_MODEL"


class VectorCollections:
    flows = "flows"
    actions = "actions"
    knowledgebase = "knowledgebase"


class ChatStrategy:
    chain = "chain"
    function = "function"
    tool = "tool"


class UserMessageResponseType:
    actionable = "actionable"  # The user message should be answered with an action (flow or api action)
    informative = (
        "informative"  # The user message should be answered a normal text response
    )


@lru_cache(maxsize=5)  # Cache all calls
def initialize_qdrant_client() -> QdrantClient:
    # Get the API key and URL from environment variables if not provided
    qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333")
    qdrant_api_key = os.getenv("QDRANT_API_KEY", None)

    client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)

    return client


def get_mysql_uri():
    mysql_uri = os.getenv("MYSQL_URI", "mysql://dbuser:dbpass@mysql:3306/opencopilot")
    if not mysql_uri:
        raise ValueError("MYSQL_URI environment variable is not set")

    # Assuming the MYSQL_URI is in the format: mysql://username:password@host:port/database
    # You may need to adjust the parsing based on the actual format of your MYSQL_URI
    components = mysql_uri.split("://")[1].split("@")
    user_pass, host_port_db = components[0], components[1]

    # Adjusting the parsing based on the expected format
    username, password = user_pass.split(":")
    host_port, database = host_port_db.split("/")

    # Adjusting further to handle the case where host and port are separated by a ":"
    host_port_components = host_port.split(":")
    if len(host_port_components) == 2:
        host, port = host_port_components
    else:
        host = host_port_components[0]
        port = "3306"  # Default MySQL port if not specified

    # Creating pymysql format string
    pymysql_uri = f"mysql+pymysql://{username}:{password}@{host}:{port}/{database}"

    return pymysql_uri


chat_strategy = os.getenv("CHAT_STRATEGY", ChatStrategy.chain)

allowed_function_loop = int(os.getenv("ALLOWED_FUNCTION_LOOP", "7"))

stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")
max_pages_to_crawl = int(os.getenv("MAX_PAGES_TO_CRAWL", "15"))

# off by default
enable_followup_questions = (
    True if os.getenv("ENABLE_FOLLOWUP_QUESTIONS", "NO") == "YES" else False
)
