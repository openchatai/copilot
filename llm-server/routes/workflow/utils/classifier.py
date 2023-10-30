from typing import Optional
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
import os

# This is a multilabel classification task and a model should be trained for this, large language models are not suited for such a task
def classify_as_api_or_document_qa(
    user_input: str
) -> Optional[str]:
    """Generates a consolidated query from chat history and an AI chat.

    Args:
      chat_history: A list of Message objects representing the chat history.
      ai_chat: A ChatOpenAI object representing the AI chat.

    Returns:
      A consolidated query string.
    """
    chat = ChatOpenAI(
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-3.5-turbo",
        temperature=0,
    )

    messages = [
        SystemMessage(
            content="You are an AI model designed classify user input into one of two labels - 'api_calling', 'document_qa'"
        ),
        HumanMessage(
            content="You will be provided with user input. If the input is a document-based question, the output will be 'document_qa.' However, if the user requests any action, such as sending a message, an email, or any other type of action, you should return 'api_calling.'"
        ),
        HumanMessage(
            content="User input: ({})".format(user_input)
        ),
    ]
    content = chat(messages).content
    return content
