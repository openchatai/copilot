import json
import logging
import re
from typing import Any, Dict, Union, cast
from typing import Any, Dict, Optional, Union, cast
from typing import List


from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from routes.workflow.extractors.extract_json import extract_json_payload
import os
from dotenv import load_dotenv
import logging
from prance import ResolvingParser
from utils.process_app_state import process_state

logging.basicConfig(level=logging.INFO)

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


def get_summaries(_swagger_doc: str) -> str:
    swagger_doc = ResolvingParser(spec_string=_swagger_doc)
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
                summary = f"- {operation['operationId']} - {operation['summary']}\n"
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
    swagger_doc: Any, user_requirement: str, headers: Any
) -> BotMessage:
    # This app state can be passed to one of the following stages
    app_state = process_state("6524d467fba1c6f306fc3160", headers=headers)
    summaries = get_summaries(swagger_doc)

    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-16k",
        temperature=0,
    )
    messages = [
        SystemMessage(
            content="You serve as an AI co-pilot tasked with identifying the correct sequence of API calls necessary to execute a user's action. If the user is asking you to perform a `CRUD` operation, provide the list of operation ids of api calls needed in the `ids` field of the json. `bot_message` should consist of a straightforward sentence, free from any special characters. Your response MUST be a valid minified json"
        ),
        HumanMessage(
            content="Here's a list of api summaries {}.".format(summaries),
        ),
        HumanMessage(content="{}".format(user_requirement)),
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
            content="If the user's question can be answered directly without making API calls, please respond appropriately in the `bot_message` section of the response and leaving the `ids` field empty ([])."
        ),
    ]

    result = chat(messages)
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
    return BotMessage.from_dict(d)
