from cachetools import cached, TTLCache
from typing import Optional

from utils.db import NoSQLDatabase
from utils.llm_consts import SUMMARIZATION_PROMPT, SYSTEM_MESSAGE_PROMPT

db_instance = NoSQLDatabase()
mongo = db_instance.get_db()


# defining it for each bot instead of app, because even for the same app we might want to add different prompts for different users
class PromptsClass:
    def __init__(self, bot_id: str):
        self.bot_id = bot_id

    @cached(cache=TTLCache(maxsize=128, ttl=60))  # TTL is set to 60 seconds (1 minute)
    def _load_prompts(self) -> dict:
        try:
            prompt = mongo.prompts.find_one({"bot_id": self.bot_id})
            if not prompt:
                return {SUMMARIZATION_PROMPT: None, SYSTEM_MESSAGE_PROMPT: None}
            return prompt
        except Exception as e:
            print(f"Error loading prompts: {e}")
            raise

    @property
    def prompts(self) -> dict:
        return self._load_prompts()

    @property
    def system_message(self) -> Optional[str]:
        return self.prompts[SYSTEM_MESSAGE_PROMPT]

    @property
    def api_summarizer(self) -> Optional[str]:
        return self.prompts[SUMMARIZATION_PROMPT]


def load_prompts(bot_id: str) -> Optional[PromptsClass]:
    try:
        if not bot_id:
            return None
        return PromptsClass(bot_id)
    except Exception as e:
        print(f"Error loading prompts: {e}")
        return None
