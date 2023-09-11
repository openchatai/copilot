from flask import request, jsonify
from jsonschema import validate, ValidationError


def validate_json(schema):
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                validate(instance=request.json, schema=schema)
                return func(*args, **kwargs)
            except ValidationError as e:
                return jsonify({"error": "Validation error", "message": str(e)}), 400

        wrapper.__name__ = func.__name__
        return wrapper

    return decorator
