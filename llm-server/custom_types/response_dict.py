from typing import NamedTuple, TypedDict, Optional, Dict, Any
import requests


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]


class ApiRequestResult(NamedTuple):
    response: requests.Response
    path_params: Dict[str, str]
    query_params: Dict[str, Any]
    method: str
    body_schema: Any


class LLMResponse(NamedTuple):
    message: Optional[str]
    error: Optional[str]
    api_request_response: ApiRequestResult
