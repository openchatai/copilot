from typing import TypedDict, Optional, Dict, List
from dataclasses import dataclass, field


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]


@dataclass
class ApiRequestResult:
    api_requests: Dict[str, str] = field(default_factory=dict)


@dataclass
class LLMResponse:
    message: Optional[str] = None
    error: Optional[str] = None
    api_request_response: ApiRequestResult = field(default_factory=ApiRequestResult)
    api_called: bool = False
    knowledgebase_called: bool = False
    operation_ids: List[str] = field(default_factory=list)
    # followup_question_list = FollowUpQuestionList(follow_up_questions=[])

    @classmethod
    def create_default(cls):
        return cls()
