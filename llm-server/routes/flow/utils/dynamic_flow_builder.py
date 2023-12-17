from routes.flow.utils.api_retrievers import get_relevant_actions
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from utils.get_chat_model import get_chat_model
from langchain.schema import BaseMessage, HumanMessage, SystemMessage
from typing import List

from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel
from typing import cast
from utils.get_logger import CustomLogger


logger = CustomLogger(__name__)


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
                "bot_message": "Any information you want to add",
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

    result = await chat.ainvoke(messages)
    dynamic_builder_payload = parse_json(cast(str, result.content))

    # Sort the array of objects based on the order of operationIds in the list
    sorted_data = sort_records(dynamic_builder_payload.operationIds, docs)

    sorted_data_dict = [item.document.metadata for item in sorted_data]
    return {"actions": sorted_data_dict, "reason": dynamic_builder_payload.bot_message}


def sort_records(
    order_list: List[str], records: List[DocumentSimilarityDTO]
) -> List[DocumentSimilarityDTO]:
    sorted_records = []
    order_set = set(order_list)
    for record in records:
        if record.document.metadata["operation_id"] in order_set:
            sorted_records.append(record)

    sorted_records.sort(
        key=lambda x: order_list.index(x.document.metadata["operation_id"])
    )
    return sorted_records
