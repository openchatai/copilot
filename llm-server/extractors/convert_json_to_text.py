import os
import json
from typing import Dict, Any, cast, List, Union

from langchain.schema import HumanMessage, SystemMessage, BaseMessage

from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from flask_socketio import emit
from entities.action_entity import ActionDTO

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

    result = stream_messages(
        system_message, messages, is_streaming, session_id, "convert_json_to_text"
    )

    return cast(str, result)


def convert_json_error_to_text(error: str, is_streaming: bool, session_id: str) -> str:
    # Define a system message requesting the LLM to explain the API error in user-friendly language
    system_message = SystemMessage(
        content="""
        As an ai chat assistant, your job is to help the user understand and resolve API error messages. When offering solutions, You will clarify without going into unnecessary detail. You must respond in less than 100 words. You should commence by saying "An error occured while trying to process your request ..." also, if you think it's auth error, ask the user to read this docs https://docs.opencopilot.so/authorization (format as markdown)
        """
    )

    messages: List[HumanMessage] = []
    messages.append(
        HumanMessage(
            content=f"The following error occurred while processing your request:\n\n{error}"
        )
    )

    result = stream_messages(
        system_message, messages, is_streaming, session_id, "convert_json_error_to_text"
    )

    return cast(str, result)


def create_readable_error(
    user_input: str, error: str, is_streaming: bool, session_id: str
) -> str:
    # Define a system message requesting the LLM to explain the API error in user-friendly language
    system_message = SystemMessage(
        content="""As an AI chat assistant, your role involves transforming schema error messages into easily understandable language for humans. 
    - Prompt the user to correct the values causing the schema errors.
    - Clearly explain to users what is wrong with the values causing the errors.
    - Be very concise, group all required errors in one sentence, validation errors should be shown separately. 
    - Tell the user we can continue with their request once the correct information has been supplied
    
    You will be given the user input and the errors associated with the json schema
    """
    )

    messages: List[HumanMessage] = []
    messages.append(HumanMessage(content=f"Here is the user input: \n\n{user_input}"))
    messages.append(HumanMessage(content=f"Here are the error: \n\n{error}"))

    result = stream_messages(
        system_message, messages, is_streaming, session_id, "create_readable_error"
    )

    return cast(str, result)


def stream_messages(
    system_message: SystemMessage,
    messages: List[HumanMessage],
    is_streaming: bool,
    session_id: str,
    tag: str,
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
