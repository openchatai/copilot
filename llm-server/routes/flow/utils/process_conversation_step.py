import os
from typing import List, Dict

from langchain.schema import BaseMessage
from openai import OpenAI

from models.repository.action_repo import find_action_by_method_id_and_bot_id
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections
from utils.make_api_call import make_api_request
from flask_socketio import emit

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()


def try_to_action(
        session_id: str,
        user_message: str,
        chat_history: List[BaseMessage],
        top_documents: Dict[str, List[DocumentSimilarityDTO]],
        bot_id
) -> str:
    """
    Processes a conversation step by generating a response based on the provided inputs.

    Args:
        bot_id:
        top_documents:
        session_id (str): The ID of the session for the chat conversation.
        user_message (str): The message from the user.
        chat_history (List[BaseMessage]): A list of previous conversation messages.

    Raises:
        ValueError: If the session ID is not defined.
    """

    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")

    functions = convert_top_documents_to_functions(top_documents)

    return process_user_instruction(functions=functions, instruction=user_message, bot_id=bot_id, session_id=session_id)


def process_user_instruction(functions, instruction, bot_id, session_id):
    SYSTEM_MESSAGE = """
    You are a helpful assistant.
    Respond to the following prompt by using function_call is the user message REQUIRE that, other than that just respond by text formatted as markdown
    """

    num_calls = 0
    messages = [
        {"content": SYSTEM_MESSAGE, "role": "system"},
        {"content": instruction, "role": "user"},
    ]

    logger.info(instruction)
    logger.info(functions)
    while num_calls < 5:
        message = ""
        try:
            response = get_openai_response(functions, messages)
            message = response.choices[0].message
            print(message)
            messages.append(message)

            emit(
                f"{session_id}_info", f"{camel_case_to_normal_with_capital(message.function_call.name)} ... \n"
            )

            logger.info(message.function_call)
            response = execute_single_action_call(operation_id=message.function_call.name, bot_id=bot_id,
                                                  args=message.function_call.arguments)

            messages.append(
                {
                    "role": "function",
                    "content": response,
                    "name": message.function_call.name
                }
            )

            num_calls += 1
        except Exception as e:
            if num_calls > 0:
                return message.content
            return False

    if num_calls >= 5:
        print(f"Reached max chained function calls: {5}")


def get_openai_response(functions, messages):
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return client.chat.completions.create(
        model="gpt-3.5-turbo-16k",
        functions=functions,
        function_call="auto",  # "auto" means the model can pick between generating a message or calling a function.
        temperature=0,
        messages=messages,
    )


def convert_top_documents_to_functions(top_documents: Dict[str, List[DocumentSimilarityDTO]]):
    actions = top_documents.get(VectorCollections.actions)
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
        "parameters": extract_parameters_schema_from_openapi_payload(openapi_payload_schema)
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
            param["name"]: param["schema"]
            for param in params
            if "schema" in param
        }
        schema["properties"]["parameters"] = {
            "type": "object",
            "properties": param_properties,
        }

    return schema


def execute_single_action_call(operation_id, bot_id, args):
    action = find_action_by_method_id_and_bot_id(operation_id=operation_id, bot_id=bot_id)

    response = make_api_request(method=action.request_type, endpoint=action.api_endpoint, body_schema={},
                                path_params={},
                                query_params={}, headers={})

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

