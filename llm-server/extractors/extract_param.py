import os

from extractors.extract_json import extract_json_payload
from utils.get_chat_model import get_chat_model
from shared.utils.opencopilot_utils import get_llm
from custom_types.t_json import JsonData
from typing import Optional, cast
from langchain.schema import HumanMessage, SystemMessage
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


async def gen_params_from_schema(
    param_schema: str, text: str, prev_resp: str, current_state: Optional[str]
) -> Optional[JsonData]:
    chat = get_chat_model()
    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can produce REST API's params / query params in json format, given the json schema, user input, data from previous api calls, and current application state."
        ),
        HumanMessage(content="Json Schema: {}.".format(param_schema)),
        HumanMessage(content="prev api responses: {}.".format(prev_resp)),
        HumanMessage(content="User's requirement: {}.".format(text)),
        HumanMessage(content="Current state: {}.".format(current_state)),
        HumanMessage(
            content="Based on the information provided, construct a valid parameter object to be used with python requests library. In cases where user input doesnot contain information for a query, DO NOT add that specific query parameter to the output. If a user doesn't provide a required parameter, use sensible defaults for required params, and leave optional params."
        ),
        HumanMessage(
            content="Your output must be a valid json, without any commentary"
        ),
    ]
    result = chat(messages)
    logger.info("[OpenCopilot] LLM Body Response: {}".format(result.content))
    d: Optional[JsonData] = extract_json_payload(result.content)
    logger.info("Parsed params from schema", text=text, params=d)
    return d
