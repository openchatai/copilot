import os
from langchain.chat_models import ChatOpenAI
from routes.workflow.extractors.extract_json import extract_json_payload
from opencopilot_utils import get_chat_model
from opencopilot_utils import get_llm
from custom_types.t_json import JsonData
from typing import Optional, Any
import logging
from langchain.schema import HumanMessage, SystemMessage

llm = get_llm()


async def gen_params_from_schema(
    param_schema: str, text: str, prev_resp: str, current_state: Optional[str]
) -> Optional[JsonData]:
    chat = get_chat_model("gpt-3.5-turbo-16k")
    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can produce REST API's params / query params in json format, given the json schema, user input, data from previous api calls, and current application state."
        ),
        HumanMessage(content="Json Schema: {}.".format(param_schema)),
        HumanMessage(content="prev api responses: {}.".format(prev_resp)),
        HumanMessage(content="User's requirement: {}.".format(text)),
        HumanMessage(content="Current state: {}.".format(current_state)),
        HumanMessage(
            content="If the user is asking to generate values for some fields, likes product descriptions, jokes etc add them."
        ),
        HumanMessage(
            content="Based on the information provided, construct a valid parameter object to be used with python requests library. In cases where user input doesnot contain information for a query, DO NOT add that specific query parameter to the output. If a user doesn't provide a required parameter, use sensible defaults for required params, and leave optional params."
        ),
        HumanMessage(content="Your output must be a valid json"),
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
