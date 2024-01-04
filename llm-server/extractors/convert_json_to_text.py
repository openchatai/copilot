import os
import json
from typing import Dict, Any, cast, List, Union

from langchain.schema import HumanMessage, SystemMessage, BaseMessage

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
    session_id: str,
) -> str:
    system_message = SystemMessage(
        content="""
    Given a JSON response, present the key information in a concise manner.
    Include relevant details, references, and links if present. Format the summary in Markdown for clarity and readability.
    Make sure to NEVER mention technical terms like "APIs, JSON, Request, etc..." and use first person pronounce (say it as if you performed the action)
    """
    )

    messages = [
        system_message,
        HumanMessage(content=user_input),
        HumanMessage(
            content="Here is the response from the apis: {}".format(api_response)
        ),
        HumanMessage(content="Now present the response in a non-tech way:"),
    ]

    result = stream_messages(system_message, messages, is_streaming, session_id)

    return cast(str, result)


def convert_json_error_to_text(
    error_dict: Dict[str, Union[str, dict]],
    is_streaming: bool,
    session_id: str,
) -> str:
    # Construct a system message prompting the AI to explain the error in a non-technical way
    system_message = SystemMessage(
        content="I am here to help you understand an error returned by an API. Based on the provided error message and any additional information, please provide a clear explanation of what went wrong, without using technical jargon or referring to APIs or JSON. Speak as if you were explaining the issue to someone who has no experience with programming. Recommend steps to be take n to navigate the issue."
    )

    messages: List[HumanMessage] = []
    messages.append(
        HumanMessage(
            content=f"The following error occurred: \n\n{json.dumps(error_dict, indent=2)}"
        )
    )

    # Call the streaming function to generate a human-friendly explanation of the error
    result = stream_messages(system_message, messages, is_streaming, session_id)

    return cast(str, result)


def stream_messages(
    system_message: SystemMessage,
    messages: List[HumanMessage],
    is_streaming: bool,
    session_id: str,
) -> str:
    chat = get_chat_model()

    all_messages: List[BaseMessage] = []
    all_messages.append(system_message)
    all_messages.extend(messages)

    result = ""
    for chunk in chat.stream(all_messages):
        if is_streaming:
            emit(session_id, chunk.content)
        result += str(chunk.content)

    return result
