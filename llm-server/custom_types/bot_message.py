import logging
from typing import Any, Dict, Union, cast
from typing import List

logging.basicConfig(level=logging.INFO)


class BotMessage:
    def __init__(self, ids: List[str], bot_message: str):
        self.ids = ids
        self.bot_message = bot_message

    def to_dict(self) -> Dict[str, Union[str, List[str]]]:
        return {"ids": self.ids, "bot_message": self.bot_message}

    @classmethod
    def from_dict(cls, data: Dict[str, Union[str, List[str]]]) -> "BotMessage":
        return cls(cast(List[str], data["ids"]), cast(str, data["bot_message"]))
