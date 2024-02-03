import jsonschema
from jsonschema import validate, Draft7Validator


class JSONValidationException(Exception):
    def __init__(self, message):
        super(JSONValidationException, self).__init__(message)


def json_schema_guardrails(schema, json_data):
    try:
        # Validate the JSON data against the provided schema using Draft202012Validator
        v = Draft7Validator(schema)
        errors = sorted(v.iter_errors(json_data), key=str)

        if errors:
            # Extract error details from ValidationError instances
            error_details = [
                str(error.path.pop()) + str(error.message) for error in errors
            ]

            # Join error details into a single string separated by newlines
            error_message = "\n".join(error_details)

            raise JSONValidationException(error_message)
        else:
            return "The JSON data is valid."

    except jsonschema.exceptions.SchemaError as se:
        return f"Schema error: {se}"
