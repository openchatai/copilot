import os
import logging
from langchain.schema import HumanMessage, SystemMessage
from utils.get_chat_model import get_chat_model
from utils.chat_models import CHAT_MODELS

openai_api_key = os.getenv("OPENAI_API_KEY")


def transform_api_response_from_schema(server_url: str, responseText: str) -> str:
    chat = get_chat_model("transform_api_response_from_schema")

    # responseText = truncate_json(json.loads(responseText))
    messages = [
        SystemMessage(content="You are a bot capable of comprehending API responses."),
        HumanMessage(
            content="Here is the response from current REST API: {} for endpoint: {}".format(
                responseText, server_url
            )
        ),
        HumanMessage(
            content="Analyze the provided API responses and extract only the essential fields required for subsequent API interactions. Disregard any non-essential attributes such as CSS or color-related data. If there are generic fields like 'id,' provide them with more descriptive names in your response. Format your response as a minified JSON object with clear and meaningful keys that map to their respective values from the API response."
        ),
    ]

    result = chat(messages)
    return result.content
