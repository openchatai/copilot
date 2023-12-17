import os
from typing import Dict, Any, cast

from langchain.schema import HumanMessage, SystemMessage

from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger

openai_api_key = os.getenv("OPENAI_API_KEY")
logger = CustomLogger(module_name=__name__)


def convert_json_to_text(
        user_input: str,
        api_response: Dict[str, Any],
        api_request_data: Dict[str, Any],
        bot_id: str
) -> str:
    chat = get_chat_model()
    system_message = SystemMessage(content="Given a JSON response, summarize the key information in a concise manner. Include relevant details, references, and links if present. Format the summary in Markdown for clarity and readability.")

    messages = [
        system_message,
        HumanMessage(
            content="You'll receive user input and server responses obtained by making calls to various APIs. Your "
                    "task is to summarize the api response that is an answer to the user input. Try to be concise and "
                    "accurate, and also include references if present."
        ),
        HumanMessage(content=user_input),
        HumanMessage(
            content="Here is the response from the apis: {}".format(api_response)
        ),
    ]

    result = chat(messages)
    logger.info(
        "Convert json to text",
        content=result.content,
        incident="convert_json_to_text",
        api_request_data=api_request_data,
    )

    return cast(str, result.content)
