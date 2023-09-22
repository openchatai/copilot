import os
from langchain.prompts import PromptTemplate
from utils.get_llm import get_llm

from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload
from custom_types.t_json import JsonData
from langchain.chat_models import ChatOpenAI

from langchain.schema import AIMessage, HumanMessage, SystemMessage
from uuid import uuid4
import json


openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()

chat = ChatOpenAI()


class UserConfirmationForm(object):
    """Response when form data is missing required info"""

    def __init__(
        self, form_data: Any, json_schema: Any, prev_api_response: Any, example: Any
    ):
        """Initialize with form data and schema"""
        super().__init__()
        self.form_data = form_data
        self.json_schema = json_schema
        self.prev_api_response = prev_api_response
        self.example = example

    def toJSON(self) -> Any:
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)


class ApiFlowState:
    def __init__(self, flow_index: int, step_index: int, form: UserConfirmationForm):
        self.flow_index = flow_index
        self.step_index = step_index
        self.form = form
        # self.uuid = uuid4()

    def __str__(self) -> str:
        return f"ApiFlowState(flow_index={self.flow_index}, step_index={self.step_index}, form={self.form})"

    def toJSON(self) -> Any:
        return json.dumps(self, default=lambda o: o.__dict__, sort_keys=True, indent=4)


def generate_user_confirmation_form(
    body_schema: JsonData, text: str, prev_api_response: str, example: str
) -> UserConfirmationForm:
    """Generate a JSON payload for React JSONForms by asking an AI assistant for missing data.

    Args:
        body_schema (JsonData): JSON Schema defining expected fields
        text (str): User input text
        prev_api_response (str): Previous API responses
        example (str): Example JSON payload

    Returns:
        Any: Generated JSON payload

    This function chats with an AI assistant to get missing data needed
    to generate a JSON payload that conforms to the provided schema.
    The returned JSON is intended to be used by React JSONForms to
    dynamically generate web forms.

    It provides the assistant with the schema, user text, API logs,
    and example JSON. The assistant's response is parsed to extract
    the generated JSON data.
    """

    messages = [
        SystemMessage(
            content="""You are an AI assistant that can generate new JSON data based on a provided example JSON, user input, and API logs. To assist in generating valid JSON, you are also given a JSON schema that describes the expected fields and data types. Your goal is to take the provided inputs and use them to create new JSON data that conforms to the schema."""
        ),
        HumanMessage(
            content=f"Here is the required information for you - API schema: {body_schema}, Api logs: {prev_api_response}, User input: {text}, Example json: {example};"
        ),
    ]

    aiResponse = chat(messages)
    response = UserConfirmationForm(
        form_data=extract_json_payload(aiResponse.content),
        json_schema={"properties": body_schema},
        prev_api_response=prev_api_response,
        example=example,
    )

    return response


def generate_additional_data_msg(
    body_schema: JsonData, text: str, prev_api_response: str, example: str
) -> str:
    """Generate a JSON payload for React JSONForms by asking an AI assistant for missing data.

    Args:
        body_schema (JsonData): JSON Schema defining expected fields
        text (str): User input text
        prev_api_response (str): Previous API responses
        example (str): Example JSON payload

    Returns:
        Any: Generated JSON payload

    This function chats with an AI assistant to get missing data needed
    to generate a JSON payload that conforms to the provided schema.
    The returned JSON is intended to be used by React JSONForms to
    dynamically generate web forms.

    It provides the assistant with the schema, user text, API logs,
    and example JSON. The assistant's response is parsed to extract
    the generated JSON data.
    """

    messages = [
        SystemMessage(
            content="""You are an AI assistant, You will have access to User input, Previous API logs and swagger schema. Your goal is to analyze the user input, API logs and swagger schema to determine if there is any information missing that would prevent you from confidently making the API call suggested by the user. If there is missing information, you will request clarification from the user otherwise you will respond by saying - 'ALL_GOOD' """
        ),
        HumanMessage(
            content=f"Here is the required information - Swagger schema: {body_schema}, Api logs: {prev_api_response}, User input: {text};"
        ),
    ]

    aiResponse = chat(messages)

    return aiResponse.content
