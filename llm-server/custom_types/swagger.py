from typing import TypedDict, Dict, Any


class SchemaProperties(TypedDict):
    properties: Any


class JSONSchema(TypedDict):
    schema: SchemaProperties


class RequestBody(TypedDict):
    content: Dict[str, JSONSchema]


class ApiOperation(TypedDict):
    requestBody: RequestBody
