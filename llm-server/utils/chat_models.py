from typing import NamedTuple


class ChatModels(NamedTuple):
    gpt_3_5_turbo: str = "gpt-3.5-turbo"
    gpt_3_5_turbo_16k: str = "gpt-3.5-turbo-16k"
    gpt_4_1106_preview="gpt-4-1106-preview"
    gpt_4_32k: str = "gpt-4-32k"
    claude_2_0: str = "claude-2.0"
    mistral_openorca: str = "mistral-openorca"
    nous_hermes = "nous-hermes"
    llama2: str = "llama2"
    xwinlm = "xwinlm"
    openchat = "openchat"


CHAT_MODELS: ChatModels = ChatModels()
