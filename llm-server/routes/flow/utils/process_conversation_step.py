import os
import json
from typing import List, Dict, Any, Union, Literal, Optional

from langchain.schema import BaseMessage
from openai import OpenAI

from models.repository.action_repo import find_action_by_method_id_and_bot_id
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections
from utils.make_api_call import make_api_request
from flask_socketio import emit

from openai.types.chat.chat_completion_message import ChatCompletionMessage
from openai.types.chat.chat_completion_chunk import ChoiceDeltaFunctionCall

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()


def try_to_action(
    session_id: str,
    user_message: str,
    chat_history: List[BaseMessage],
    top_documents: Dict[str, List[DocumentSimilarityDTO]],
    bot_id,
    is_streaming: bool,
) -> Any:
    """
    Processes a conversation step by generating a response based on the provided inputs.

    Args:
        bot_id:
        top_documents:
        session_id (str): The ID of the session for the chat conversation.
        user_message (str): The message from the user.
        chat_history (List[BaseMessage]): A list of previous conversation messages.
    """

    emit(f"{session_id}_info", "Finding the right actions... \n")
    functions = convert_top_documents_to_functions(top_documents)

    return process_user_instruction(
        functions=functions,
        instruction=user_message,
        bot_id=bot_id,
        session_id=session_id,
        is_streaming=is_streaming,
    )


def process_user_instruction(
    functions: Union[List[Any], Literal[False]],
    instruction: str,
    bot_id: str,
    session_id: str,
    is_streaming: bool,
):
    SYSTEM_MESSAGE = """
    You are a helpful assistant.
    Respond to the following prompt by using function_call if the user message REQUIRES that, other than that just respond by text formatted as markdown
    """

    num_calls = 0

    messages = [
        {"content": SYSTEM_MESSAGE, "role": "system"},
        {"content": instruction, "role": "user"},
    ]

    logger.info(instruction)
    logger.info(functions)
    completion_response = StreamingCompletionResponse(message="", function_call=None)
    while num_calls < 5:
        try:
            completion_response = get_openai_completion(
                functions, messages, session_id, is_streaming
            )

            if (
                completion_response.function_call
                and completion_response.function_call.name is not None
            ):
                emit(
                    f"{session_id}_info",
                    f"{camel_case_to_normal_with_capital(completion_response.function_call.name)} ... \n",
                )

                logger.info(completion_response.function_call)
                action_response = execute_single_action_call(
                    operation_id=completion_response.function_call.name,
                    bot_id=bot_id,
                    args=completion_response.function_call.arguments,
                )

                if action_response:
                    messages.append(
                        {
                            "role": "function",
                            "content": action_response,
                            "name": completion_response.function_call.name,
                        }
                    )
                else:
                    raise Exception("The function call didn't succeed")

            if completion_response.message:
                messages.append(
                    {"content": completion_response.message, "role": "assistant"}
                )

                raise Exception("No more actions...")

            num_calls += 1
        except Exception as e:
            logger.error("Failed to call function", error=e)
            if num_calls > 0:
                return completion_response.message
            return False

    if num_calls >= 5:
        print(f"Reached max chained function calls: {5}")


class StreamingCompletionResponse:
    function_call: Optional[ChoiceDeltaFunctionCall]
    message: Optional[str]

    def __init__(
        self, function_call: Optional[ChoiceDeltaFunctionCall], message: Optional[str]
    ) -> None:
        self.function_call = function_call
        self.message = message


def get_openai_completion(functions, messages, session_id: str, is_streaming: bool):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo-16k",
        functions=functions,
        function_call="auto",  # "auto" means the model can pick between generating a message or calling a function.
        temperature=0,
        messages=messages,
        stream=True,
    )
    complete_content = ""
    for chunk in completion:
        if chunk.choices[0].delta.function_call:
            emit(
                f"{session_id}_info",
                f"Selected action: {chunk.choices[0].delta.function_call}",
            )
            return StreamingCompletionResponse(
                function_call=chunk.choices[0].delta.function_call,
                message=None,
            )

        elif chunk.choices[0].delta.content:
            complete_content += chunk.choices[0].delta.content
            emit(session_id, chunk.choices[0].delta.content) if is_streaming else None

    return StreamingCompletionResponse(function_call=None, message=complete_content)


def convert_top_documents_to_functions(
    top_documents: Dict[str, List[DocumentSimilarityDTO]]
):
    actions = top_documents.get(VectorCollections.actions)
    if not actions:
        return None

    if len(actions) == 0:
        return False

    functions = []
    for action in actions:
        function = convert_single_action_to_function(action)
        functions.append(function)
    return functions


def convert_single_action_to_function(action: DocumentSimilarityDTO):
    action_metadata = action.document.metadata
    operation_id = action_metadata.get("operation_id")
    description = action_metadata.get("description")
    openapi_payload_schema = action_metadata.get("payload")

    return {
        "name": operation_id,
        "description": description,
        "parameters": extract_parameters_schema_from_openapi_payload(
            openapi_payload_schema or {}
        ),
    }


def extract_parameters_schema_from_openapi_payload(payload: dict):
    schema = {"type": "object", "properties": {}}

    req_body = (
        payload.get("requestBody", {})
        .get("content", {})
        .get("application/json", {})
        .get("schema")
    )
    if req_body:
        schema["properties"]["requestBody"] = req_body

    params = payload.get("parameters", [])
    if params:
        param_properties = {
            param["name"]: param["schema"] for param in params if "schema" in param
        }
        schema["properties"]["parameters"] = {
            "type": "object",
            "properties": param_properties,
        }

    return schema


def get_defined_params(input_str: str):
    if input_str == "":
        return {}
    # Parse the input string as JSON
    data = json.loads(input_str)

    # Extract the parameters sub-dictionary
    params = data.get("parameters")

    # Filter out any undefined values (i.e., None or empty strings)
    filtered_params = {k: v for k, v in params.items() if v is not None and v != ""}

    return filtered_params


def execute_single_action_call(operation_id: str, bot_id: str, args: Optional[str]):
    action = find_action_by_method_id_and_bot_id(
        operation_id=operation_id, bot_id=bot_id
    )

    if not action:
        return

    parsed_args = get_defined_params(args)

    response = make_api_request(
        method=str(action.request_type),
        endpoint=str(action.api_endpoint),
        body_schema={},
        path_params=parsed_args,
        query_params=parsed_args,
        headers={},
    )

    return response.text


def camel_case_to_normal_with_capital(input_str):
    """
    Convert a camel case string to a normal string with spaces between words and capitalize the first letter.
    Example: "CamelCaseString" -> "Camel case string"

    :param input_str: A string in camel case format.
    :return: A string converted to normal format with spaces and the first letter capitalized.
    """
    # Initialize an empty string for the result
    result = ""

    # Iterate over each character in the input string
    for i, char in enumerate(input_str):
        # If the character is uppercase, add a space before it (except for the first character)
        if char.isupper() and i != 0:
            result += " " + char.lower()
        else:
            result += char.lower()

    # Capitalize the first letter of the result and return it
    return result.capitalize()
