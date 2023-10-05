import os
from langchain.chat_models import ChatOpenAI
from routes.workflow.extractors.extract_json import extract_json_payload
from utils.get_llm import get_llm
from custom_types.t_json import JsonData
from typing import Optional, Any
import logging
from langchain.schema import HumanMessage, SystemMessage

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def gen_params_from_schema(
    param_schema: str, text: str, prev_resp: str
) -> Optional[JsonData]:
    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-16k",
        temperature=0,
    )

    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can produce REST API's params / query params in json format, given the json schema, user input, data from previous api calls."
        ),
        HumanMessage(content="Json Schema: {}".format(param_schema)),
        HumanMessage(content="User input: {}".format(text)),
        HumanMessage(content="prev api responses: {}".format(prev_resp)),
        HumanMessage(
            content="Given the provided information, generate the appropriate JSON payload to use as parameters for the API request"
        ),
    ]
    result = chat(messages)

    logging.info("[OpenCopilot] LLM Body Response: {}".format(result.content))

    d: Optional[JsonData] = extract_json_payload(result.content)
    logging.info(
        "[OpenCopilot] Parsed the json payload: {}, context: {}".format(
            d, "gen_body_from_schema"
        )
    )

    return d
