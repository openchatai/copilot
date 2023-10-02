from typing import Callable, Any, Dict

from flask import request, jsonify
from jsonschema import validate, ValidationError


def validate_json(schema: Dict[str, Any]) -> Callable[..., Any]:
    def decorator(func: Callable[..., Any]) -> Callable[..., Any]:
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            try:
                validate(instance=request.json, schema=schema)
                return func(*args, **kwargs)
            except ValidationError as e:
                return jsonify({"error": "Validation error", "message": str(e)}), 400

        wrapper.__name__ = func.__name__
        return wrapper

    return decorator
