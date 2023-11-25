import json
import logging
import re
from typing import Any, Dict, Union, cast
from typing import Any, Dict, Optional, Union, cast
from typing import List
from langchain.chat_models import ChatOpenAI

from langchain.schema import AIMessage, HumanMessage, SystemMessage
from utils.chat_models import CHAT_MODELS
from utils.get_chat_model import get_chat_model
from routes.workflow.extractors.extract_json import extract_json_payload
import os
import logging
from prance import ResolvingParser
from models.repository.chat_history_repo import (
    get_all_chat_history_by_session_id,
    get_chat_message_as_llm_conversation,
)
from opencopilot_db import ChatHistory

logging.basicConfig(level=logging.INFO)


class BotMessage:
    def __init__(self, ids: List[str], bot_message: str):
        self.ids = ids
        self.bot_message = bot_message

    def to_dict(self) -> Dict[str, Union[str, List[str]]]:
        return {"ids": self.ids, "bot_message": self.bot_message}

    @classmethod
    def from_dict(cls, data: Dict[str, Union[str, List[str]]]) -> "BotMessage":
        return cls(cast(List[str], data["ids"]), cast(str, data["bot_message"]))


def join_conversations(chat_histories: List[ChatHistory]) -> str:
    """Joins a list of ChatHistory objects into a single conversation string.

    Args:
      chat_histories: A list of ChatHistory objects.

    Returns:
      A string containing the joined conversation.
    """

    conversation = ""
    for chat_history in chat_histories:
        if chat_history.from_user:
            conversation += f"User: {chat_history.message}\n"
        else:
            conversation += f"Assistant: {chat_history.message}\n"
    return conversation


def get_summaries(swagger_doc: ResolvingParser) -> str:
    servers = ", ".join(
        [s["url"] for s in swagger_doc.specification.get("servers", [])]
    )
    summaries_str = "servers:" + servers + "\n"
    paths = swagger_doc.specification.get("paths")
    for path in paths:
        operations = paths[path]
        for method in operations:
            operation = operations[method]
            try:
                if "summary" in operation:
                    summary = f"- {operation['operationId']} - {operation['summary']}\n"
                else:
                    summary = (
                        f"- {operation['operationId']} - {operation['description']}\n"
                    )
                if "requestBody" in operation:
                    content_types = operation["requestBody"]["content"]
                    if "application/json" in content_types:
                        schema = content_types["application/json"]["schema"]
                        if "properties" in schema:
                            params = schema["properties"].keys()
                        elif "items" in schema:
                            params = schema["items"]["properties"].keys()
                    elif "application/octet-stream" in content_types:
                        params = ["binary data"]
                    summary += f"  - Body Parameters: {', '.join(params)}\n"
                summary += f"  - Method: {method}\n"
                if "parameters" in operation:
                    params = [p["name"] for p in operation["parameters"]]
                    summary += f"  - Parameters: {', '.join(params)}\n"
                summaries_str += summary + "\n"
            except:
                pass
    return summaries_str


def hasSingleIntent(
    swagger_doc: ResolvingParser,
    user_requirement: str,
    session_id: str,
    current_state: Optional[str],
    app: str,
) -> BotMessage:
    summaries = get_summaries(swagger_doc)
    chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)

    messages = [
        SystemMessage(
            content="You serve as an AI co-pilot tasked with identifying the correct sequence of API calls necessary to execute a user's action. To accomplish the task, you will be provided with information about the existing state of the application and list of api summaries. If the user is asking you to perform a `CRUD` operation, provide the list of operation ids of api calls needed in the `ids` field of the json. `bot_message` should consist of a straightforward sentence, free from any special characters. Note that the application uses current state as a cache, if you don't find the required information in the cache, you should try to find an api call to fetch that information. Your response MUST be a valid minified json"
        )
    ]

    # old conversations go here
    prev_conversations = []
    if session_id:
        prev_conversations = get_chat_message_as_llm_conversation(session_id)

    if len(prev_conversations) > 0:
        messages.extend(prev_conversations)

    if current_state:
        messages.extend(
            [
                HumanMessage(
                    content="Here is the current state of the application: {}".format(
                        current_state
                    )
                )
            ]
        )

    messages.extend(
        [
            HumanMessage(
                content="Here's a list of api summaries {}.".format(summaries),
            ),
            HumanMessage(
                content="""Reply in the following json format ```{
                "ids": [
                    "list",
                    "of",
                    "operation",
                    "ids"
                ],
                "bot_message": "Bot response here" 
            }```"""
            ),
            HumanMessage(
                content="If the question can be answered directly without making API calls, please respond appropriately in the `bot_message` section of the response and leaving the `ids` field empty ([])."
            ),
            HumanMessage(content=user_requirement),
        ]
    )

    result = chat([x for x in messages if x is not None])
    logging.info(
        "[OpenCopilot] Extracted the needed steps to get the job done: {}".format(
            result.content
        )
    )
    d: Any = extract_json_payload(result.content)
    logging.info(
        "[OpenCopilot] Parsed the json payload: {}, context: {}".format(
            d, "hasSingleIntent"
        )
    )

    bot_message = BotMessage.from_dict(d)
    return bot_message
