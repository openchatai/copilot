from langchain.output_parsers import PydanticOutputParser
from langchain_core.pydantic_v1 import BaseModel
from typing import List, cast
from langchain.schema import HumanMessage, SystemMessage, BaseMessage

from utils import get_chat_model
from utils.get_logger import CustomLogger
from dataclasses import dataclass

logger = CustomLogger(module_name=__name__)


class FollowUpQuestion(BaseModel):
    label: str
    value: str


class FollowUpQuestionList(BaseModel):
    follow_up_questions: List[FollowUpQuestion]


def extract_follow_up_questions(content: str):
    parser = PydanticOutputParser(pydantic_object=FollowUpQuestionList)
    r = parser.parse(content)

    return r


def generate_conversation_string(conversation_history: List[BaseMessage]) -> str:
    conversation_str = ""
    # add trim history for robustness
    for message in conversation_history[-8:]:
        if message.type == "ai":
            conversation_str += f"Assistant: {message.content} \n"
        if message.type == "Human":
            conversation_str += f"Human: {message.content} \n"
    return conversation_str


async def generate_follow_up_questions(
    conversation_history: List[BaseMessage], llm_response: str, current_input: str
):
    chat = get_chat_model()
    conversation_string = generate_conversation_string(conversation_history)
    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can predict follow-up questions that the user may ask."
        ),
        HumanMessage(
            content="""Given the conversation history and last agent reply below, generate upto 3 follow up responses that the user may ask as json array without any commentary. Following is the schema that you should follow to return your response: 
            {
                "follow_up_questions": [{
                        "label": "Why is the sky blue?",
                        "value": "Why is the sky blue during the day?"
                    }, 
                    {
                    ...
                    }
                ]
            }"""
        ),
        HumanMessage(content="History: {}.".format(conversation_string)),
        HumanMessage(content="Current Input: {}.".format(current_input)),
        HumanMessage(content="Assistant response: {}.".format(llm_response)),
    ]
    result = await chat.ainvoke(messages)
    logger.info("[OpenCopilot] LLM Body Response: {}".format(result.content))

    # Assuming extract_follow_up_questions is a function to extract follow-up questions from the model's response
    followup = extract_follow_up_questions(cast(str, result.content))

    return followup
