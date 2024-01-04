from typing import TypedDict, Optional, Set


class ResponseDict(TypedDict):
    response: Optional[str]
    error: Optional[str]
    source: Set[str]
