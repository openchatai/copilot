from utils.get_chat_model import get_chat_model
from langchain.schema import HumanMessage, SystemMessage
from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel, Field
from routes.chat.followup_generator import generate_conversation_string


class IsControversial(BaseModel):
    is_controversial_subject: bool = Field(description="is it a controversial subject or not")
    message: str = Field(description="why it is controversial or not")

def is_controversial_subject(conversation_history: str, text: str):
    chat_model = get_chat_model()
    messages = [
        SystemMessage(content="You are an assistant that can figure out if a topic is controversial and replies in the given json format."),
        HumanMessage(content="""You should output in the following format: 
                    {"is_controversial_subject": true, "message: "your reasoning for why it is controversial in 1 sentence."} 
                        or 
                    {"is_controversial_subject": false, "message": "your reasoning for why it is not controversial in 1 sentence."}"""
                )
    ]
    if len(conversation_history) > 0:
        conversation_string = generate_conversation_string(conversation_history)
        messages.append(HumanMessage(content=f"""
            This is the conversation history between you and the me: {conversation_string}, now i have some followup question for you.
        """))

    messages.append(HumanMessage(content=f"Please reply in given json as i told you without any commentary if this text is controversial or not: {text}"))
    
    response = chat_model(messages).content
    parser = PydanticOutputParser(pydantic_object=IsControversial)
    try:
        parsed_response = parser.parse(response)
        return parsed_response
    except ValueError:
        return IsControversial(is_controversial_subject=False, message="I")