from langchain.chat_models import ChatOpenAI
from langchain.chat_models.base import BaseChatModel
from langchain.chat_models import ChatOllama, ChatAnthropic
from .chat_models import CHAT_MODELS

import os

localip = os.getenv("LOCAL_IP", "localhost")


def get_chat_model(prop: str) -> BaseChatModel:
    if prop == CHAT_MODELS.gpt_3_5_turbo:
        return ChatOpenAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model=CHAT_MODELS.gpt_3_5_turbo,
            temperature=0,
        )

    elif prop == CHAT_MODELS.gpt_3_5_turbo_16k:
        return ChatOpenAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model=CHAT_MODELS.gpt_3_5_turbo_16k,
            temperature=0,
        )
    elif prop == CHAT_MODELS.claude_2_0:
        return ChatAnthropic(
            anthropic_api_key=os.getenv("CLAUDE_API_KEY", "CLAUDE_API_KEY")  # type: ignore
        )
    elif prop == CHAT_MODELS.mistral_openorca:
        return ChatOllama(
            base_url=f"{localip}:11434",
            model=CHAT_MODELS.mistral_openorca,
            temperature=0,
        )
    elif prop == CHAT_MODELS.nous_hermes:
        return ChatOllama(
            base_url=f"{localip}:11434",
            model=CHAT_MODELS.nous_hermes,
            temperature=0,
        )
    elif prop == CHAT_MODELS.xwinlm:
        return ChatOllama(
            base_url=f"{localip}:11434",
            model=CHAT_MODELS.xwinlm,
            temperature=0,
        )
    elif prop == "llama2":
        return ChatOpenAI(model="llama2", temperature=0)
    else:
        raise ValueError(
            "Couldn't match one of the supported models, please refer to llm-server/readme.md"
        )
