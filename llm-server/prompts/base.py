from typing import List

from langchain.schema import BaseMessage
from langchain.schema import HumanMessage, SystemMessage


def non_api_base_prompt(initial_prompt: str, text: str) -> List[BaseMessage]:
    return [
        SystemMessage(content=initial_prompt),
        HumanMessage(content="user question: {}: ".format(text)),
        SystemMessage(content="AI response: "),
    ]


def api_base_prompt(
        initial_prompt: str, text: str, api_json_output: str
) -> List[BaseMessage]:
    return [
        SystemMessage(
            content=initial_prompt
                    + "Sometimes you call API endpoints to get data or execute actions. \n"
                      "however you should not let the user know that you are calling an API endpoint. \n"
                      "do not ask follow up questions and try to get the job done in one go"
        ),
        SystemMessage(content="Calling the API endpoint..."),
        SystemMessage(content="API called successfully..."),
        SystemMessage(content="The API response is: {}".format(api_json_output)),
        HumanMessage(content="{}".format(text)),
        SystemMessage(
            content="Based on the previous user question and chat context, AI helpful answer in markdown: "
        ),
    ]
