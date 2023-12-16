from routes.flow.utils.api_retrievers import get_relevant_actions
from utils.get_chat_model import get_chat_model
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel
from typing import cast


class DynamicBuilder(BaseModel):
    bot_message: str
    operationIds: List[str]


def parse_json(content: str):
    parser = PydanticOutputParser(pydantic_object=DynamicBuilder)
    r = parser.parse(content)

    return r


async def build_dynamic_flow(text: str, bot_id: str):
    docs = await get_relevant_actions(text=text, bot_id=bot_id)
    chat = get_chat_model()

    messages: List[BaseMessage] = []

    messages.append(
        SystemMessage(
            content="You are a planning agent, that plans out the sequence of actions that have to be taken to fulfil a user request. An action could be anything from making calls to an api, connecting to an external data source... etc..."
        )
    )

    messages.append(
        HumanMessage(
            content=f"""Given a list of actions in random order, and an input text that follows, find the correct sequence of action_ids needed to fulfill the upcoming requests. Return the response in json format without any commentary. You may only need a subset of actions provided to meet the user requirement.
            
            Your response should be of the following format
            ---
            {{
                "bot_message": "Clarification for choosing the operation_ids",
                "operationIds": ["list", "of", "operation ids", "for", "actions"]
            }}
            ---
            
            Here's the list of actions:
            ---
            {docs}
            ---
            
            
            Here's the user input:
            ---
            {text}
            ---
            """
        )
    )

    content = await chat.ainvoke(messages)

    json = parse_json(cast(str, content))
    return json
