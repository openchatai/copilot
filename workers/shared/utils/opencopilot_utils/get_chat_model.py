from langchain.chat_models import ChatOpenAI, ChatOllama, ChatAnthropic
import os
from opencopilot_utils import ENV_CONFIGS
from .chat_models import CHAT_MODELS

localip = os.getenv("LOCAL_IP", "localhost")
def get_chat_model(prop: str) -> ChatOpenAI:
    if prop == CHAT_MODELS.gpt_3_5_turbo:
        return ChatOpenAI(
            openai_api_key=ENV_CONFIGS.OPENAI_API_KEY,
            model=CHAT_MODELS.gpt_3_5_turbo,
            temperature=0,
        )

    elif prop == CHAT_MODELS.gpt_3_5_turbo_16k:
        return ChatOpenAI(
            openai_api_key=ENV_CONFIGS.OPENAI_API_KEY,
            model=CHAT_MODELS.gpt_3_5_turbo_16k,
            temperature=0,
        )

    elif prop == CHAT_MODELS.claude_2_0:
        return ChatAnthropic(
            model=CHAT_MODELS.claude_2_0, anthropic_api_key=ENV_CONFIGS.CLAUDE_API_KEY
        )

    elif prop == CHAT_MODELS.mistral_openorca:
        return ChatOllama(base_url=f"{localip}:11434", model=CHAT_MODELS.mistral_openorca, temperature=0)
    elif prop == CHAT_MODELS.llama2:
        return ChatOpenAI(model=CHAT_MODELS.llama2, temperature=0)

    else:
        raise "Couldn't match one of the supported models, please refer `utils/constants.py`"
