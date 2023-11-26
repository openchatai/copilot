from enum import Enum


# defines router actions
class ActionType(Enum):
    ASSISTANT_ACTION = "__ASSISTANT__"
    KNOWLEDGE_BASE_QUERY = "__KNOWLEDGEBASE__"
    GENERAL_QUERY = "GENERAL_QUERY"
