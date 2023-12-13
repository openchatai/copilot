from typing import Dict
from langchain.chat_models import ChatOpenAI
from langchain.chat_models.base import BaseChatModel
from langchain.chat_models import ChatOllama, ChatAnthropic
from utils import llm_consts
from .chat_models import CHAT_MODELS
from functools import lru_cache
from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

import os

localip = os.getenv("LOCAL_IP", "localhost")

model_name = os.getenv(llm_consts.model_env_var, CHAT_MODELS.gpt_3_5_turbo_16k)


@lru_cache(maxsize=1)
def get_chat_model() -> BaseChatModel:
    if model_name == CHAT_MODELS.gpt_3_5_turbo:
        model = ChatOpenAI(
            model=CHAT_MODELS.gpt_3_5_turbo,
            temperature=0,
            streaming=True,
            callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
        )
    elif model_name == CHAT_MODELS.gpt_4_32k:
        model = ChatOpenAI(
            temperature=0,
            model=CHAT_MODELS.gpt_4_32k,
            streaming=True,
            callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
        )
    elif model_name == CHAT_MODELS.gpt_4_1106_preview:
        model = ChatOpenAI(
            temperature=0,
            model=CHAT_MODELS.gpt_4_1106_preview,
            streaming=True,
            callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
        )
    elif model_name == CHAT_MODELS.gpt_3_5_turbo_16k:
        model = ChatOpenAI(
            model=CHAT_MODELS.gpt_3_5_turbo_16k,
            temperature=0,
            streaming=True,
            callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
        )
    elif model_name == "claude":
        model = ChatAnthropic(
            anthropic_api_key=os.getenv("CLAUDE_API_KEY"),
            streaming=True,
            callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
        )
    elif model_name == "openchat":
        model = ChatOllama(base_url=f"{localip}:11434", model="openchat", temperature=0)
    else:
        raise ValueError(f"Unsupported model: {model_name}")
    return model
