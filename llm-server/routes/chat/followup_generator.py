from langchain.output_parsers import PydanticOutputParser
from langchain_core.pydantic_v1 import BaseModel
from typing import List, cast
from langchain.schema import HumanMessage, SystemMessage, BaseMessage

from utils import get_chat_model
from routes.flow.utils.document_similarity_dto import (
    DocumentSimilarityDTO,
)


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
    conversation_history: List[BaseMessage],
    llm_response: str,
    current_input: str,
    actions: List[DocumentSimilarityDTO],
    knowledgebase: List[DocumentSimilarityDTO],
):
    chat = get_chat_model("generate_follow_up_questions")
    conversation_string = generate_conversation_string(conversation_history)
    content = ""
    for action in actions:
        content = content + action.document.page_content + "\n"

    for kb in knowledgebase:
        content = content + kb.document.page_content + "\n"

    messages = [
        SystemMessage(
            content="You are an intelligent machine learning model that can predict follow-up questions that the user may ask."
        ),
        HumanMessage(
            content=f"The followup questions you generate should correspond to the question asked by the user and your capabilities. Your capabilities are as follows: {content}"
        ),
        HumanMessage(
            content=f"The followup questions you generate should correspond to the question asked by the user and your capabilities. Your capabilities are as follows: {content}"
        ),
        HumanMessage(
            content="Limit your response to 4 follow-up questions based on most similar content to knowledgebase and actions."
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

    # Assuming extract_follow_up_questions is a function to extract follow-up questions from the model's response
    followups = extract_follow_up_questions(cast(str, result.content))

    return followups
