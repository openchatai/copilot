from langchain.llms import AzureOpenAI, OpenAI
import os
from dotenv import load_dotenv
from langchain.llms import LlamaCpp
from langchain.llms.base import BaseLLM

from langchain.callbacks.manager import CallbackManager
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from typing import Dict, Callable
from langchain.llms.ollama import Ollama

load_dotenv()


def get_llama_llm() -> BaseLLM:
    llm = Ollama(
        model="llama2",
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    )
    return llm


def get_openorca_llm() -> BaseLLM:
    llm = Ollama(
        model="mistral-openorca",
        callback_manager=CallbackManager([StreamingStdOutCallbackHandler()]),
    )
    return llm


# Azure OpenAI Language Model client
def get_azure_openai_llm() -> AzureOpenAI:
    """Returns AzureOpenAI instance configured from environment variables"""

    openai_api_type = os.environ["OPENAI_API_TYPE"]
    openai_api_key = os.environ["AZURE_OPENAI_API_KEY"]
    openai_deployment_name = os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"]
    openai_model_name = os.environ["AZURE_OPENAI_COMPLETION_MODEL"]
    openai_api_version = os.environ["AZURE_OPENAI_API_VERSION"]
    openai_api_base = os.environ["AZURE_OPENAI_API_BASE"]
    return AzureOpenAI(
        openai_api_base=openai_api_base,
        openai_api_key=openai_api_key,
        deployment_name=openai_deployment_name,
        model_name=openai_model_name,
        openai_api_type=openai_api_type,
        openai_api_version=openai_api_version,
        temperature=0,
        batch_size=8,
    )


# OpenAI Language Model client
def get_openai_llm() -> BaseLLM:
    """Returns OpenAI instance configured from environment variables"""

    openai_api_key = os.environ["OPENAI_API_KEY"]

    return OpenAI(temperature=0, openai_api_key=openai_api_key)


def get_llm() -> BaseLLM:
    """Returns LLM client instance based on OPENAI_API_TYPE"""

    clients: Dict[str, Callable[[], BaseLLM]] = {
        "azure": get_azure_openai_llm,
        "openai": get_openai_llm,
        "llama2": get_llama_llm,
        "mistral-openorca": get_openorca_llm,
    }

    api_type = os.environ.get("OPENAI_API_TYPE")
    if api_type not in clients:
        raise ValueError(f"Invalid OPENAI_API_TYPE: {api_type}")

    return clients[api_type]()
