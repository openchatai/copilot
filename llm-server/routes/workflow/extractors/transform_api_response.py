import os, logging
from langchain.chat_models import ChatOpenAI
from custom_types.t_json import JsonData
from typing import Optional
from dotenv import load_dotenv
from langchain.schema import HumanMessage, SystemMessage
from typing import Any
from routes.workflow.extractors.extract_json import extract_json_payload

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")


def transform_api_response_from_schema(
    server_url: str, api_response: str
) -> Optional[JsonData]:
    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo-16k",
        temperature=0,
    )

    messages = [
        SystemMessage(
            content="You are an intelligent AI assistant that can identify important fields from a REST API response."
        ),
        HumanMessage(
            content="Here is the response from a REST API call: {} for endpoint: {}".format(
                api_response, server_url
            )
        ),
        HumanMessage(
            content="Please examine the given API response and return only the fields that are important when making API calls. Ignore any unimportant fields. Structure your response as a JSON object with self-descriptive keys mapped to the corresponding values from the API response."
        ),
    ]

    result = chat(messages)
    logging.info("[OpenCopilot] LLM Body Response: {}".format(result.content))

    d = extract_json_payload(result.content)
    logging.info(
        "[OpenCopilot] Parsed the json payload: {}, context: {}".format(
            d, "gen_body_from_schema"
        )
    )

    return d
