from typing import Optional, Dict
from pydantic import BaseModel


class ActionDTO(BaseModel):
    bot_id: str
    name: Optional[str] = ""
    description: Optional[str] = ""
    api_endpoint: Optional[str] = ""
    request_type: Optional[str] = ""
    operation_id: Optional[str] = None  # Set as None initially

    # Additional Pydantic configuration
    class Config:
        extra = "allow"

    payload: Dict = {}

    def __init__(self, **data):
        super().__init__(**data)
        # Generate and assign operation_id if name is provided
        if self.name:
            self.operation_id = self.generate_operation_id_from_name(self.name)

    def to_dict(self):
        return self.dict()

    @staticmethod
    def generate_operation_id_from_name(content: str) -> str:
        words = content.split()
        # Capitalize the first letter of each word except the first one
        camel_case_words = [words[0].lower()] + [word.capitalize() for word in words[1:]]
        # Join the words to form the camelCase ID
        return ''.join(camel_case_words)
