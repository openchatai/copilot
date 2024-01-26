from typing import List, cast
from langchain.schema import BaseMessage, AIMessage, HumanMessage, SystemMessage
from utils.get_chat_model import get_chat_model


def get_last_4(arr):
    if arr is None or len(arr) == 0:
        return []
    if len(arr) <= 4:
        return arr[-len(arr) :]
    return arr[-4:]


async def get_consolidate_question(
    conversation_history: List[BaseMessage], user_input: str
) -> str:
    if len(conversation_history) == 0:
        return user_input

    messages: List[BaseMessage] = []
    messages.append(
        SystemMessage(
            content="You are a chat inspector, everytime you look at a new line of chat, you are able to piece references in the chat with information you looked at earlier, and output them."
        )
    )
    messages.append(
        HumanMessage(
            content="""Given a conversation history, replace occurrences of references like "it," "they," etc. in the latest input with their actual values. Remember, you are not supposed to answer the user question, merely enhance the latest user input

Conversation history:
---
User: Can you recommend a good restaurant nearby?
Assistant: Sure, how about trying that Italian place on Main Street? It has great pasta.

User input: What do they serve?
---

Output: "What does the Italian place on Main Street serve?"
"""
        )
    )

    messages.append(
        HumanMessage(
            content=f"Here's the conversation history: ```{conversation_history}```"
        )
    )
    messages.append(HumanMessage(content=f"{user_input}"))

    chat = get_chat_model()
    result = await chat.ainvoke(messages)

    return cast(str, result.content)
