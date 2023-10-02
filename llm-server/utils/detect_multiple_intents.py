import json
import logging
import re
from typing import Any, Dict, Optional, Union, cast
from typing import List


from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from routes.workflow.extractors.extract_json import extract_json_payload
import os
from dotenv import load_dotenv

load_dotenv()


class BotMessage:
    def __init__(self, ids: List[str], bot_message: str):
        self.ids = ids
        self.bot_message = bot_message

    def to_dict(self) -> Dict[str, Union[str, List[str]]]:
        return {"ids": self.ids, "bot_message": self.bot_message}

    @classmethod
    def from_dict(cls, data: Dict[str, Union[str, List[str]]]) -> "BotMessage":
        return cls(cast(List[str], data["ids"]), cast(str, data["bot_message"]))


def getSummaries(swagger_doc: Any):
    """Get API endpoint summaries from an OpenAPI spec."""

    summaries: List[str] = []

    # Get the paths and iterate over them
    paths: Optional[Dict[str, Any]] = swagger_doc.get("paths")
    if not paths:
        raise ValueError("OpenAPI spec missing 'paths'")

    for path in paths:
        operation = paths[path]
        for field in operation:
            if "summary" in operation[field]:
                summaries.append(
                    f"""{operation[field]["operationId"]} - {operation[field]["description"]}"""
                )

    return summaries


def hasSingleIntent(swagger_doc: Any, user_requirement: str) -> BotMessage:
    summaries = getSummaries(swagger_doc)

    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"), model="gpt-3.5-turbo-16k"
    )
    messages = [
        SystemMessage(
            content="You are an ai copilot that helps find the right sequence of api calls to perform a user action. You always respond with a valid json payload. If the user is not related to the given summary, just respond with a suitable answer"
        ),
        HumanMessage(
            content="Here's a list of api summaries {}".format(summaries),
        ),
        HumanMessage(
            content="""Reply in the following json format ```{
                "ids": [
                    "list",
                    "of",
                    "operation",
                    "ids"
                ],
                "bot_message": "Bot reasoning here" 
            }```"""
        ),
        HumanMessage(content="{}".format(user_requirement)),
    ]

    result = chat(messages)
    d: Any = extract_json_payload(result.content)
    return BotMessage.from_dict(d)
