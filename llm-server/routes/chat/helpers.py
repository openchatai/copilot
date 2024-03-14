from langchain.output_parsers import PydanticOutputParser
from langchain.pydantic_v1 import BaseModel
from typing import List


class Intent(BaseModel):
    intent_type: str
    confidence: float


class Intents(BaseModel):
    intents: List[Intent]


def parse_json_intent(content: str):
    parser = PydanticOutputParser(pydantic_object=Intents)
    r = parser.parse(content)

    return r
