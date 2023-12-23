from typing import Optional, Dict
from pydantic import BaseModel


class ActionDTO(BaseModel):
    bot_id: str
    name: str
    api_endpoint: str
    request_type: str
    description: Optional[str]
    operation_id: Optional[str] = None  # Set as None initially
    payload: Dict = {}

    # Additional Pydantic configuration
    class Config:
        extra = "allow"

    def __init__(self, **data):
        super().__init__(**data)
        # Generate and assign operation_id if name is provided
        if self.name and not self.operation_id:
            self.operation_id = self.generate_operation_id_from_name(self.name)

    @staticmethod
    def generate_operation_id_from_name(content: str) -> str:
        words = content.split()
        # Capitalize the first letter of each word except the first one
        camel_case_words = [words[0].lower()] + [
            word.capitalize() for word in words[1:]
        ]
        # Join the words to form the camelCase ID
        return "".join(camel_case_words)
