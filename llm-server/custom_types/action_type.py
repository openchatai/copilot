from enum import Enum


# defines router actions
class ActionType(Enum):
    ASSISTANT_ACTION = "assistant_action"
    KNOWLEDGE_BASE_QUERY = "knowledge_base_query"
    GENERAL_QUERY = "general_query"
