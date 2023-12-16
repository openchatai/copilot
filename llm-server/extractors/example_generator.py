from typing import Any, Dict, List, Union
import json
import random

from faker import Faker

fake = Faker()


def generate_example_json(
    schema: Dict[str, Any], num_items: int = 1, include_optional: bool = True
) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    def generate_example_property(
        property_schema: Dict[str, Any], required: bool = True
    ) -> Any:
        if "example" in property_schema:
            return property_schema["example"]

        if "type" in property_schema:
            if "format" in property_schema:
                return generate_example_with_format(property_schema)
            elif property_schema["type"] == "object":
                example_property: Union[Dict[str, Any], List[Any]] = {}
                if "properties" in property_schema:
                    for prop_name, prop_schema in property_schema["properties"].items():
                        # Check if property is required in the schema
                        is_required = required and prop_name in schema.get(
                            "required", []
                        )
                        if is_required or include_optional:
                            example_property[prop_name] = generate_example_property(
                                prop_schema, is_required
                            )
                return example_property
            elif property_schema["type"] == "array":
                example_property = []
                if "items" in property_schema:
                    for _ in range(num_items):
                        example_property.append(
                            generate_example_property(property_schema["items"])
                        )
                return example_property
            elif property_schema["type"] == "string":
                if "enum" in property_schema:
                    return random.choice(property_schema["enum"])
                else:
                    return fake.word()
            elif property_schema["type"] == "integer":
                return fake.random_int(min=0, max=100)
            elif property_schema["type"] == "number":
                return fake.random_number(decimals=2, min_value=0, max_value=100)
            elif property_schema["type"] == "boolean":
                return fake.boolean()
            elif property_schema["type"] == "null":
                return None

    def generate_example_with_format(property_schema: Dict[str, Any]) -> Any:
        format_type = property_schema["format"]

        if format_type == "date-time":
            return fake.iso8601()
        elif format_type == "date":
            return fake.date()
        elif format_type == "int64":
            return fake.random_int(min=0, max=9223372036854775807)
        elif format_type == "int32":
            return fake.random_int(min=0, max=2147483647)
        else:
            return fake.word()

    example_json: Union[Dict[str, Any], List[Dict[str, Any]]] = {}

    # Handle root-level arrays
    if schema.get("type") == "array":
        example_json = []
        for _ in range(num_items):
            example_json.append(generate_example_property(schema["items"]))
    else:
        for prop_name, prop_schema in schema["properties"].items():
            # Check if property is required in the schema
            is_required = prop_name in schema.get("required", [])
            if is_required or include_optional:
                example_json[prop_name] = generate_example_property(
                    prop_schema, is_required
                )

    return example_json


def gen_ex_from_schema(schema: Any) -> Any:
    return json.dumps(generate_example_json(schema), separators=(",", ":"))
