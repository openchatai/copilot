import os
import logging
from utils import struct_log
from langchain.schema import HumanMessage, SystemMessage

from integrations.custom_prompts.prompt_loader import load_prompts
from typing import Optional, Dict, Any
from utils import get_chat_model
from utils.chat_models import CHAT_MODELS

openai_api_key = os.getenv("OPENAI_API_KEY")


def convert_json_to_text(
    user_input: str,
    api_response: str,
    app: Optional[str],
    api_request_data: Dict[str, Any],
) -> str:
    chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)

    struct_log.info(
        event="convert_json_to_text", message="api_request_data", data=api_request_data
    )

    api_summarizer_template = None
    system_message = SystemMessage(
        content="You are a chatbot that can understand API responses"
    )
    prompt_templates = load_prompts(app)
    if prompt_templates.api_summarizer:
        api_summarizer_template = prompt_templates.api_summarizer

    if app is not None and api_summarizer_template is not None:
        system_message = SystemMessage(content=api_summarizer_template)

    messages = [
        system_message,
        HumanMessage(
            content="You'll receive user input and server responses obtained by making calls to various APIs. You will also recieve a dictionary that specifies, the body, param and query param used to make those api calls. Your task is to transform the JSON response into a response that in an answer to the user input. You should inform the user about the filters that were used to make these api calls"
        ),
        HumanMessage(content="Here is the user input: {}.".format(user_input)),
        HumanMessage(
            content="Here is the response from the apis: {}".format(api_response)
        ),
        HumanMessage(
            content="Here is the api_request_data: {}".format(api_request_data)
        ),
    ]

    result = chat(messages)
    logging.info("[OpenCopilot] Transformed Response: {}".format(result.content))

    return result.content
