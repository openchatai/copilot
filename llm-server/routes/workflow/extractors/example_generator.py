from typing import Any, Dict, List, Union

import json
from jsonschema import Draft7Validator, exceptions
from faker import Faker
import random

fake = Faker()


def generate_example_json(schema: Dict[str, Any]) -> Dict[str, Any]:
    example_json: Dict[str, Any] = {}

    def generate_example_property(property_schema: Dict[str, Any]) -> Any:
        if "example" in property_schema:
            return property_schema["example"]

        if "type" in property_schema:
            if property_schema["type"] == "object":
                example_property: Union[Dict[str, Any], List[Any]] = {}
                if "properties" in property_schema:
                    for prop_name, prop_schema in property_schema["properties"].items():
                        example_property[prop_name] = generate_example_property(
                            prop_schema
                        )
                return example_property
            elif property_schema["type"] == "array":
                example_property = []
                if "items" in property_schema:
                    for _ in range(2):  # Generate 2 items for the example array
                        example_property.append(
                            generate_example_property(property_schema["items"])
                        )
                return example_property
            elif property_schema["type"] == "string":
                if "enum" in property_schema:
                    return random.choice(
                        property_schema["enum"]
                    )  # Select a random enum value
                else:
                    return fake.word()
            elif property_schema["type"] == "integer":
                return 0
            elif property_schema["type"] == "boolean":
                return False

    for prop_name, prop_schema in schema["properties"].items():
        example_json[prop_name] = generate_example_property(prop_schema)

    return example_json


# This function can be used to generate an example value for llm, incase the response is not correct
def generate_example_from_schema(input: Any) -> Any:
    schema = input["requestBody"]["content"]["application/json"]["schema"]
    return generate_example_json(schema)
