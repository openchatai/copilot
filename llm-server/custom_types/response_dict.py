from typing import NamedTuple, TypedDict, Optional, Dict, Any
import requests
from dataclasses import dataclass, field


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]


@dataclass
class ApiRequestResult:
    api_requests: Dict[str, str] = field(default_factory=dict)


class LLMResponse(NamedTuple):
    message: Optional[str]
    error: Optional[str]
    api_request_response: ApiRequestResult

    @classmethod
    def create_default(cls):
        return cls(
            message=None,
            error=None,
            api_request_response=ApiRequestResult(),
        )
