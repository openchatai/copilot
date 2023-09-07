from flask import jsonify
from marshmallow.exceptions import ValidationError
from typing import Any, Callable, Dict, Tuple, Union


def handle_exceptions_and_errors(
    func: Callable[..., Tuple[Union[Dict[str, str], Any], int]]
) -> Callable[..., Tuple[Union[Dict[str, str], Any], int]]:
    def wrapper(*args: Any, **kwargs: Any) -> Tuple[Union[Dict[str, str], Any], int]:
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return jsonify({"error": "Validation error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500

    wrapper.__name__ = func.__name__
    return wrapper
