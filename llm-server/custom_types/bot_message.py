from typing import List, Optional
from langchain.pydantic_v1 import BaseModel, Field
from langchain.output_parsers import PydanticOutputParser

class BotMessage(BaseModel):
    bot_message: str = Field(description="Message from the bot")
    ids: List[str] = Field(description="List of IDs")
    missing_information: Optional[str] = Field(description="Incase of ambiguity ask user follow up question")
    
    
# Set up a parser + inject instructions into the prompt template.
bot_message_parser = PydanticOutputParser(pydantic_object=BotMessage)


# bot_message_parser.parse(input_string)
def parse_bot_message(input: str) -> BotMessage:
    return bot_message_parser.parse(input)