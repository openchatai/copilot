from sse_starlette.sse import EventSourceResponse
from typing import Any


async def emit(event: str, data: Any):
    async def event_generator():
        yield dict(data=data, event=event)

    return EventSourceResponse(event_generator())
