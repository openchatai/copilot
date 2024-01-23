from typing import NamedTuple, TypedDict, Optional, Dict, Any
import requests
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
    api_request_response: ApiRequestResult = ApiRequestResult()
    api_called: bool = False
    knowledgebase_called: bool = False

    @classmethod
    def create_default(cls):
        return cls()
