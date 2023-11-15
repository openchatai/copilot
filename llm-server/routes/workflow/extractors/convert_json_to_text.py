import os, logging
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload
from utils import get_chat_model
from utils.chat_models import CHAT_MODELS

openai_api_key = os.getenv("OPENAI_API_KEY")


def convert_json_to_text(user_input: str, api_response: str) -> str:
    # chat = ChatOpenAI(
    #     openai_api_key=os.getenv("OPENAI_API_KEY"),
    #     model=CHAT_MODELS.mistral_openorca,
    #     temperature=0,
    # )
    chat = get_chat_model(CHAT_MODELS.mistral_openorca)

    messages = [
        SystemMessage(
            content="You are a chatbot that can understand API responses. You'll receive both user input and server responses obtained by making calls to various APIs. Your task is to transform the JSON response into a response that matches the user's input, extracting only relevant information. The resulting output should provide a brief answer to the user's question in just two sentences."
        ),
        HumanMessage(content="Here is the user input: {}.".format(user_input)),
        HumanMessage(
            content="Here is the response from the apis: {}".format(api_response)
        ),
    ]

    result = chat(messages)
    logging.info("[OpenCopilot] Transformed Response: {}".format(result.content))

    return result.content
