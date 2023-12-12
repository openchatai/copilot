from typing import List, cast, Union, Dict, Any

from langchain.schema import HumanMessage, SystemMessage, BaseMessage
from langchain.schema import OutputParserException
from custom_types.bot_message import parse_bot_message, BotMessage
from routes.workflow.utils.document_similarity_dto import DocumentSimilarityDTO

from utils.get_chat_model import get_chat_model
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections

logger = CustomLogger(module_name=__name__)
chat = get_chat_model()

"""
@todo
# 1. Add application initial state here as well
# 2. Add api data from qdrant so that the llm understands what apis are available to it for use
"""


def is_it_informative_or_actionable(chat_history, current_message,
                                    available_document_types: List[DocumentSimilarityDTO]):
    """
    This function will take the user message and some context around it, and then will see if the user is requesting
    something that can be answered in informative way or can be actionable (api action or a flow).

    if it was actionable, then it will summarize what the user want
    Args:
        available_document_types:
        chat_history:
        current_message:

    Returns:

    """

    if len(available_document_types) == 1 and VectorCollections.knowledgebase == available_document_types[0].type:
        """
        That means it is informative, and the LLM should be able to answer the question based on the given context or
        by itself (based on the base prompt).
        """
        return False

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
    
    Now I will send you the user input
    '''


def process_conversation_step(
        session_id: str,
        user_message: str,
        knowledgebase: List[DocumentSimilarityDTO],
        actions: List[DocumentSimilarityDTO],
        chat_history: List[BaseMessage],
        flows: List[DocumentSimilarityDTO],
        base_prompt: str,
) -> Union[Dict[str, Any], BotMessage]:
    """
    Processes a conversation step by generating a response based on the provided inputs.

    Args:
        session_id (str): The ID of the session for the chat conversation.
        user_message (str): The message from the user.
        knowledgebase (List[DocumentSimilarityDTO]): A list of DocumentSimilarityDTO objects representing the knowledgebase documents.
        actions (List[DocumentSimilarityDTO]): A list of DocumentSimilarityDTO objects representing the API actions.
        chat_history (List[BaseMessage]): A list of previous conversation messages.
        flows (List[DocumentSimilarityDTO]): A list of DocumentSimilarityDTO objects representing the API flows.
        base_prompt (str): The base prompt for the conversation.

    Returns:
        Union[Dict[str, Any], BotMessage]: If the response can be parsed as JSON, returns a dictionary containing the response. Otherwise, returns a BotMessage object.

    Raises:
        ValueError: If the session ID is not defined.
    """

    if not session_id:
        raise ValueError("Session id must be defined for chat conversations")

    messages: List[BaseMessage] = [
        SystemMessage(content=base_prompt),
        SystemMessage(
            content="You will have access to a list of APIs and some useful information, called context."
        ),
    ]

    if len(chat_history) > 0:
        messages.extend(chat_history[-5:])

    if len(knowledgebase) > 0 and len(actions) > 0 and len(flows) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{knowledgebase}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{actions}```. I also found some api flows, that maybe able to answer the following question ```{flows}```. If one of the flows can accurately answer the question, then set `id` in the response should be the ids defined in the flows. Flows should take precedence over the normal swagger apis"
            )
        )

    elif len(knowledgebase) > 0 and len(actions) > 0:
        messages.append(
            HumanMessage(
                content=f"Here is some relevant context I found that might be helpful - ```{knowledgebase}```. Also, here is the excerpt from API swagger for the APIs I think might be helpful in answering the question ```{actions}```. "
            )
        )
    elif len(knowledgebase) > 0:
        messages.append(
            HumanMessage(
                content=f"I found some relevant context that might be helpful. Here is the context: ```{knowledgebase}```. "
            )
        )
    elif len(actions) > 0:
        messages.append(
            HumanMessage(
                content=f"I found API summaries that might be helpful in answering the question. Here are the api summaries: ```{actions}```. "
            )
        )
    elif len(flows) > 0:
        messages.append(
            HumanMessage(
                content=f"I found some flows definitions that might be helpful in replying to the user. You must select one flow that can answer the user. Here are the flow definitions ```{flows}```."
            )
        )

    messages.append(
        HumanMessage(
            content="""Based on the information provided to you and the conversation history of this conversation, I want you to answer the questions that follow. Your should respond with a json that looks like the following, you must always use the operationIds provided in api summaries. Do not make up an operation id - 
    {
        "ids": ["list", "of", "operationIds", "for apis to be called"],
        "bot_message": "your response based on the instructions provided at the beginning",
        "missing_information": "Optional Field; Incase of ambiguity ask clarifying questions. You should not worry about the api filters or query, that should be decided by a different agent."
    }                

    Don't add operation ids if you can reply by merely looking in the conversation history.
    """
        )
    )
    messages.append(
        HumanMessage(content="If you are unsure / confused, ask clarifying questions")
    )

    messages.append(HumanMessage(content=user_message))

    logger.info("messages array", messages=messages)

    content = cast(str, chat(messages=messages).content)

    try:
        d = parse_bot_message(content)
        logger.info(
            "Extracting JSON payload",
            action="parse_bot_message",
            data=d,
            content=content,
        )
        return d

    except OutputParserException as e:
        logger.warn("Failed to parse json", data=content, err=str(e))
        return BotMessage(bot_message=content, ids=[], missing_information=None)
    except Exception as e:
        logger.warn("unexpected error occurred", err=str(e))
        return BotMessage(ids=[], bot_message=str(e), missing_information=None)
