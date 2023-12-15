from typing import List, cast
from langchain.schema import BaseMessage, AIMessage, HumanMessage, SystemMessage
from utils.get_chat_model import get_chat_model


async def get_consolidate_question(
    conversation_history: List[BaseMessage], user_input: str
) -> str:
    if len(conversation_history) == 0:
        return user_input

    conversation_str = ""
    for message in conversation_history:
        if message.type == "ai":
            conversation_str += f"Assistant: {message.content} \n"
        if message.type == "Human":
            conversation_str += f"Human: {message.content} \n"

    messages: List[BaseMessage] = []
    messages.append(
        HumanMessage(
            content=f"""Given the conversation history and the user's latest input which may be vague, construct a clear, standalone query that captures the user's intended meaning, without ambiguity. Replace any reference to objects / entities etc... with their real names / values. If reference is not found return the latest user input. I will use the output given by you to do a similarity search to find relevant conversations. 
            Conversation history: ```{conversation_str}```, 
            latest_user_input: ```{user_input}```
        """
        )
    )

    chat = get_chat_model()
    result = await chat.ainvoke(messages)

    return cast(str, result.content)
