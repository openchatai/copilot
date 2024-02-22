import json
from typing import List, cast, Dict

from langchain.schema import HumanMessage, SystemMessage, BaseMessage

from custom_types.actionable_or_not_type import (
    parse_actionable_or_not_response,
    ActionableOrNotType,
    parse_informative_or_actionable_response,
)
from routes.flow.utils.document_similarity_dto import DocumentSimilarityDTO
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()


def is_it_informative_or_actionable(
    chat_history: List[BaseMessage],
    current_message: str,
    available_documents: Dict[str, List[DocumentSimilarityDTO]],
) -> ActionableOrNotType:
    """
    This function will take the user message and some context around it, and then will see if the user is requesting
    something that can be answered in informative way or can be actionable (api action or a flow).

    if it was actionable, then it will summarize what the user want
    Args:
        available_documents:
        chat_history:
        current_message:

    Returns:

    """

    if (
        len(available_documents) == 1
        and VectorCollections.knowledgebase in available_documents
    ):
        """
        That means it is informative, and the LLM should be able to answer the question based on the given context or
        by itself (based on the base prompt).
        """
        return parse_actionable_or_not_response({"actionable": False})

    actionable_tools = ""
    for document in available_documents:
        for dto in available_documents[document]:
            if dto.type is VectorCollections.knowledgebase:
                continue
            actionable_tools = (
                actionable_tools
                + " \n API ({}): ".format(dto.document.metadata.get("operation_id"))
                + dto.document.page_content
            )

    prompt = (
        """You are an AI tool that classifies whether user input requires an API call or not. You should recommend using an API if the user request matches one of the APIs descriptions below. The user requests that can be fulfilled by calling an external API to either execute something or fetch more data to help in answering the question. Also, if the user question is asking you to perform actions (e.g. list, create, update, delete) then you will need to use an API.

Examples:  

**User Input:** Create a B-1 visa application

**Available APIs:**  
- API(createVisaApplication): This API creates a B-1 visa application. 
- API(getVisaStatus): This API queries B-1 visa status.   

**Verdict:** Needs API call so the response should be {"needs_api": "yes", "justification": "The reason behind your verdict", "api": "createVisaApplication"}

**Justification:** The user is asking to create a visa application and the (createVisaApplication) API can be used to satisfy the user requirement.  

**Another Example:**

**User Input:** How to renew a B-1 visa  

**Available APIs:**   
- API(createVisaApplication): This API creates a B-1 visa application.  
- API(renewVisa): This API renews an existing B-1 visa.

**Verdict:** Does not need API call so the response should be {"needs_api": "no", "justification": "The reason behind your verdict", "api": ""}  

**Justification:** The user is asking how to renew a B-1 visa, which is an informational question that does not require an API call.

**One More Example:**

**User Input:** Get status of my B-1 visa application  

**Available APIs:**    
- API(getVisaStatus): This API queries status of a B-1 visa application.

**Verdict:** Needs API call so the response should be {"needs_api": "yes", "justification": "The user is asking to get visa status", "api": "getVisaStatus"}

**Response Format:** Always respond with JSON without any commentary, for example: {"needs_api": "no", "justification": "The reason behind your verdict", "api": "apiName"}  

===END EXAMPLES===
The available tools:
    """
        + actionable_tools
        + """
    Based on the above, here is the user input/questions:
    """
    )

    # logger.info("cool", payload=actionable_tools)
    messages: List[BaseMessage] = [
        SystemMessage(content=prompt),
    ]
    messages.extend(chat_history[-6:])
    messages.append(HumanMessage(content=current_message))
    messages.append(
        HumanMessage(
            content="Return the corresponding json for the last user input, without any commentary."
        )
    )

    content = cast(str, chat(messages=messages).content)

    logger.info("informative_or_actionable_payload", str_content=content)
    parsed_json = parse_informative_or_actionable_response(content)

    response = parse_actionable_or_not_response(
        json_dict={"actionable": parsed_json.needs_api == "yes", "api": parsed_json.api}
    )

    logger.info(
        "Actionable or not response",
        payload=parsed_json,
        final_result=response.actionable,
    )
    return response


def get_next_response_type(
    session_id: str,
    user_message: str,
    chat_history: List[BaseMessage],
    top_documents: Dict[str, List[DocumentSimilarityDTO]],
) -> ActionableOrNotType:
    """
    Processes a conversation step by generating a response based on the provided inputs.

    Args:
        top_documents:
        session_id (str): The ID of the session for the chat conversation.
        user_message (str): The message from the user.
        chat_history (List[BaseMessage]): A list of previous conversation messages.

    Raises:
        ValueError: If the session ID is not defined.
    """

    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")

    return is_it_informative_or_actionable(
        chat_history=chat_history,
        current_message=user_message,
        available_documents=top_documents,
    )
