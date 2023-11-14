from typing import NamedTuple


class ChatModels(NamedTuple):
    gpt_3_5_turbo: str = "gpt-3.5-turbo"
    gpt_3_5_turbo_16k: str = "gpt-3.5-turbo-16k"
    claude_2_0: str = "claude-2.0"
    mistral_openorca: str = "mistral-openorca"
    llama2: str = "llama2"


CHAT_MODELS: ChatModels = ChatModels()
