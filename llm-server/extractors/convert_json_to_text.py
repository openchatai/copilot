import os
from typing import Dict, Any, cast

from langchain.schema import HumanMessage, SystemMessage

from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from flask_socketio import emit
openai_api_key = os.getenv("OPENAI_API_KEY")
logger = CustomLogger(module_name=__name__)


def convert_json_to_text(
        user_input: str,
        api_response: Dict[str, Any],
        api_request_data: Dict[str, Any],
        bot_id: str,
        is_streaming: bool,
        session_id: str
) -> str:
    chat = get_chat_model()
    system_message = SystemMessage(content="""
    Given a JSON response, summarize the key information in a concise manner.
    Include relevant details, references, and links if present. Format the summary in Markdown for clarity and readability.
    Make sure to NEVER mention technical terms like "APIs, JSON, Request, etc..." and use first person pronounce (say it as if you performed the action)
    """)

    messages = [
        system_message,

        HumanMessage(content=user_input),
        HumanMessage(
            content="Here is the response from the apis: {}".format(api_response)
        ),
        HumanMessage(
            content="Now summarize the response in a non-tech way:"
        ),
    ]

    result = ""
    for chunk in chat.stream(messages):
        emit(session_id, chunk.content) if is_streaming else None
        result += str(chunk.content)
        
    logger.info(
        "API call json response",
        content=result,
        incident="convert_json_to_text",
        api_request_data=api_response
    )

    return cast(str, result)
