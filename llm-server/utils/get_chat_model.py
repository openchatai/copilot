from langchain.chat_models import ChatOpenAI
from langchain.chat_models import ChatOllama

from typing import Optional

import os

local_ip = os.getenv("LOCAL_IP", "localhost")


def get_chat_model(prop: str) -> ChatOpenAI:
    if prop == "gpt-3.5-turbo":
        return ChatOpenAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-3.5-turbo",
            temperature=0,
        )

    elif prop == "gpt-3.5-turbo-16k":
        return ChatOpenAI(
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            model="gpt-3.5-turbo-16k",
            temperature=0,
        )

    elif prop == "mistral-openorca":
        print(f"Returning instance of mistral-openorca")
        return ChatOllama(
            model="mistral-openorca", temperature=0, base_url=f"http://{local_ip}:11434"
        )
    elif prop == "llama2":
        return ChatOpenAI(model="llama2", temperature=0)
    else:
        raise "Couldn't match one of the supported models, please refer llm-server/readme.md"
