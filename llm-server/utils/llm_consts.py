import os
from typing import TypedDict
from functools import lru_cache
from qdrant_client import QdrantClient

EXPERIMENTAL_FEATURES_ENABLED = os.getenv("EXPERIMENTAL_FEATURES_ENABLED", "NO")
SYSTEM_MESSAGE_PROMPT = "system_message_prompt"
SUMMARIZATION_PROMPT = "summarization_prompt"
X_App_Name = "X-App-Name"


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


class UserMessageResponseType:
    actionable = "actionable"  # The user message should be answered with an action (flow or api action)
    informative = "informative"  # The user message should be answered a normal text response



@lru_cache(maxsize=None)  # Cache all calls
def initialize_qdrant_client() -> QdrantClient:
    # Get the API key and URL from environment variables if not provided
    api_key = os.getenv("QDRANT_PASS", None)
    qdrant_url = os.getenv("QDRANT_URL", "http://qdrant:6333")

    # Check if both API key and URL are defined
    if api_key is None or qdrant_url is None:
        raise ValueError("API key and URL must be defined.")

    # Initialize the QdrantClient with the provided API key and URL
    client = QdrantClient(url=qdrant_url, api_key=api_key)
    return client