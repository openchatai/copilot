from typing import List
from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel, Field


class InformativeBotResponse(BaseModel):
    bot_message: str = Field(description="Message from the bot")
    ids: List[str] = Field(description="List of IDs")


# Set up a parser + inject instructions into the prompt template.
bot_message_parser = PydanticOutputParser(pydantic_object=InformativeBotResponse)


# bot_message_parser.parse(input_string)
def parse_informative_bot_response(input: str) -> InformativeBotResponse:
    return bot_message_parser.parse(input)
