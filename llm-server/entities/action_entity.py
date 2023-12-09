import datetime
import uuid
from typing import Optional, Dict

from pydantic import BaseModel


class ActionDTO(BaseModel):
    id: str = str(uuid.uuid4())
    name: Optional[str] = ""
    description: Optional[str] = ""
    base_uri: Optional[str] = ""
    request_type: Optional[str] = ""
    operation_id: Optional[str] = ""
    # Payload contains Swagger endpoint parameters and request body as JSON.
    # Example structure:
    # {
    #   "parameters": [
    #     {
    #       "name": "petId",
    #       "in": "path",
    #       "description": "ID of pet to update",
    #       "required": true,
    #       "schema": {
    #         "type": "integer",
    #         "format": "int64"
    #       }
    #     },
    #     {
    #       "name": "additionalMetadata",
    #       "in": "query",
    #       "description": "Additional Metadata",
    #       "required": false,
    #       "schema": {
    #         "type": "string"
    #       }
    #     }
    #   ],
    #   "requestBody": {
    #     "content": {
    #       "application/octet-stream": {
    #         "schema": {
    #           "type": "string",
    #           "format": "binary"
    #         }
    #       }
    #     }
    #   }
    # }
    payload: Dict = {}

    def to_dict(self):
        return self.dict()
