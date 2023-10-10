from typing import Any


def parseFn(data: Any) -> Any:
    return data["boards"]


# we can use fuzzy search to look for a value, but this is an optimization task that we can do later
def transformFn(data: Any) -> Any:
    return data
