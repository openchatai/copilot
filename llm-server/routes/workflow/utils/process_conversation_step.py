from typing import List, cast, Union, Dict, Any

from langchain.schema import HumanMessage, SystemMessage, BaseMessage

from custom_types.actionable_or_not_type import parse_actionable_or_not_response
from custom_types.bot_message import BotMessage
from routes.workflow.utils.document_similarity_dto import DocumentSimilarityDTO
from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections, UserMessageResponseType

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()


def is_it_informative_or_actionable(chat_history: List[BaseMessage], current_message: str,
                                    available_documents: Dict[str, List[DocumentSimilarityDTO]]):
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

    if len(available_documents) == 1 and VectorCollections.knowledgebase in available_documents:
        """
        That means it is informative, and the LLM should be able to answer the question based on the given context or
        by itself (based on the base prompt).
        """
        return False  # not actionable => informative

    actionable_tools = ""
    counter = 1
    for document in available_documents:
        for dto in available_documents[document]:
            if dto.type is VectorCollections.knowledgebase:
                continue
        actionable_tools = actionable_tools + "\n (Tool {}): ".format(counter) + dto.document.page_content
        counter = counter + 1

    prompt = '''
    You are an AI tool that classifies user input as actionable or not. Actionable input refers to requests that can be fulfilled by calling an external tool. You will be provided with the user's input and descriptions of available tools. If the user's request can be fulfilled using one of these tools, it is considered actionable.

    Example

    **User Input:** create a b-1 visa application

    **Available Tools:**
    - Tool 1: This tool creates a b-1 visa application.
    - Tool 2: This tool queries b-1 status.

    **Verdict:** Actionable

    **Justification:** The user's request can be fulfilled by using Tool 1.

    **Another Example:**

    **User Input:** how to create a b-1 visa application

    **Available Tools:**
    - Tool 1: This tool creates a b-1 visa application.
    - Tool 2: This tool queries b-1 status.

    **Verdict:** Not Actionable

    **Justification:** The user is asking about how to create a visa application, which can be answered through text without the need to call a tool.

    **Response Format:** Always respond with JSON, for example: {'actionable': false}
    
    ===END EXAMPLES===
    The available tools :
    
    ''' + actionable_tools + '''
    Based on the above, here is the user input/questions:
    '''

    messages: List[BaseMessage] = [
        SystemMessage(content=prompt),
    ]
    messages.extend(
        chat_history[-5:]
    )
    messages.append(
        HumanMessage(content=current_message)
    )
    messages.append(
        HumanMessage(content="Based on that, please answer if the previous user messages is actionable or not in JSON")
    )

    content = cast(str, chat(messages=messages).content)

    response = parse_actionable_or_not_response(content)

    return response.actionable


def get_next_response_type(
        session_id: str,
        user_message: str,
        chat_history: List[BaseMessage],
        top_documents: Dict[str, List[DocumentSimilarityDTO]]

) -> Dict[str]:
    """
    Processes a conversation step by generating a response based on the provided inputs.

    Args:
        top_documents:
        session_id (str): The ID of the session for the chat conversation.
        user_message (str): The message from the user.
        chat_history (List[BaseMessage]): A list of previous conversation messages.
        base_prompt (str): The base prompt for the conversation.

    Returns:
        Union[Dict[str, Any], BotMessage]: If the response can be parsed as JSON, returns a dictionary containing the response. Otherwise, returns a BotMessage object.

    Raises:
        ValueError: If the session ID is not defined.
    """

    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")

    if is_it_informative_or_actionable(chat_history=chat_history, current_message=user_message,
                                       available_documents=top_documents):
        return {"type": UserMessageResponseType.actionable}

    return {"type": UserMessageResponseType.informative}

