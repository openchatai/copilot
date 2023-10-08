import json
import logging
import re
from typing import Any, Dict, Union, cast
from typing import List


from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from routes.workflow.extractors.extract_json import extract_json_payload
import os
from dotenv import load_dotenv
import logging
from prance import ResolvingParser
from utils.db import Database

logging.basicConfig(level=logging.DEBUG)
db_instance = Database()
mongo = db_instance.get_db()

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
    swagger_doc: Any, user_requirement: str, platform=None
) -> BotMessage:
    summaries = get_summaries(swagger_doc)
    customizer = mongo.customizer.find_one(
        {"platform": platform}
    )  # to be replaced by bot argument, if bot was built for trello, we should get an input trello
    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-16k",
        temperature=0,
    )

    system_message = "You serve as an AI co-pilot tasked with identifying the correct sequence of API calls necessary to execute a user's action. It is essential that you consistently provide a valid JSON payload (use double quotes) in your responses. If the user's input is a `question` and does not involve initiating any actions or require API calls, please respond appropriately in the `bot_message` section of the response while leaving the `ids` field empty ([]). If the user is asking you to perform a `CRUD` operation, provide the list of operation ids of api calls needed in the `ids` field of the json. `bot_message` should consist of a straightforward sentence, free from any special characters."

    if customizer and "constraints" in customizer and customizer["constraints"]:
        system_message += " You should also adhere to the provided rules if they are defined. The user's prompts may sometimes be unclear or ambiguous. Following these steps will assist you in generating accurate API sequences: {}.".format(
            customizer["constraints"]
        )

    messages = [
        SystemMessage(content=system_message),
        HumanMessage(
            content="Here's a list of api summaries {}.".format(summaries),
        ),
        HumanMessage(content="{}.".format(user_requirement)),
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
