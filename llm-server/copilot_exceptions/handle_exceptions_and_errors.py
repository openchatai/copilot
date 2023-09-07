from flask import jsonify
from marshmallow.exceptions import ValidationError


def handle_exceptions_and_errors(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return jsonify({"error": "Validation error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500

    wrapper.__name__ = func.__name__
    return wrapper
