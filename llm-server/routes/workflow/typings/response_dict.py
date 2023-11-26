from typing import TypedDict, Optional


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]
