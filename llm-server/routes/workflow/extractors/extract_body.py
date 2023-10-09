import os
from langchain.schema import AIMessage, HumanMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from utils.get_llm import get_llm

from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload
from custom_types.t_json import JsonData
import logging

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def gen_body_from_schema(
    body_schema: str, text: str, prev_api_response: str, example: str
) -> Any:
    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-16k",
        temperature=0,
    )

    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can produce REST API's body in json format, given the json schema, dummy json payload, user input, data from previous api calls."
        ),
        HumanMessage(content="Json Schema: {}".format(body_schema)),
        HumanMessage(content="Dummy json payload: {}".format(example)),
        HumanMessage(content="User input: {}".format(text)),
        HumanMessage(content="prev api responses: {}".format(prev_api_response)),
        HumanMessage(
            content="Given the provided information, generate the appropriate minified JSON payload to use as body for the API request."
        ),
    ]
    result = chat(messages)

    logging.info("[OpenCopilot] LLM Body Response: {}".format(result.content))

    d: Any = extract_json_payload(result.content)
    logging.info(
        "[OpenCopilot] Parsed the json payload: {}, context: {}".format(
            d, "gen_body_from_schema"
        )
    )

    return d
