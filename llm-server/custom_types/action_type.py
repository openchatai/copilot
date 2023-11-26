from enum import Enum


# defines router actions
class ActionType(Enum):
    ASSISTANT_ACTION = "__need__assistant__"
    KNOWLEDGE_BASE_QUERY = "__knowledgebase__"
    GENERAL_QUERY = "general_query"
