import os
from functools import lru_cache

from langchain.chat_models import ChatOllama, ChatAnthropic
from langchain.chat_models import ChatOpenAI
from langchain.chat_models.base import BaseChatModel

from utils import llm_consts
from .chat_models import CHAT_MODELS

localip = os.getenv("LOCAL_IP", "localhost")

model_name = os.getenv(llm_consts.model_env_var, CHAT_MODELS.gpt_3_5_turbo_16k)


# To allow support for json responses, pass the modelKwargs
"""
const chat = new ChatOpenAI({
   modelName: "gpt-4-1106-preview",
   modelKwargs: {
     "response_format": {
       type: "json_object"
     }
   }
});
"""


@lru_cache(maxsize=1)
def get_chat_model() -> BaseChatModel:
    if model_name == CHAT_MODELS.gpt_3_5_turbo:
        model = ChatOpenAI(
            model=CHAT_MODELS.gpt_3_5_turbo,
            temperature=0
        )
    elif model_name == CHAT_MODELS.gpt_4_32k:
        model = ChatOpenAI(temperature=0, model=CHAT_MODELS.gpt_4_32k)
    elif model_name == CHAT_MODELS.gpt_4_1106_preview:
        model = ChatOpenAI(temperature=0, model=CHAT_MODELS.gpt_4_1106_preview)
    elif model_name == CHAT_MODELS.gpt_3_5_turbo_16k:
        model = ChatOpenAI(
            model=CHAT_MODELS.gpt_3_5_turbo_16k,
            temperature=0
        )
    elif model_name == "claude":
        model = ChatAnthropic(
            anthropic_api_key=os.getenv("CLAUDE_API_KEY"),
            model_name="claude-instant-1.2"
        )
    elif model_name == "openchat":
        model = ChatOllama(base_url=f"{localip}:11434", model="openchat", temperature=0)
    else:
        raise ValueError(f"Unsupported model: {model_name}")
    return model
