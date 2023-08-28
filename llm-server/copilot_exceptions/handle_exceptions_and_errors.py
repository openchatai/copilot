def handle_exceptions_and_errors(func):
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except ValidationError as e:
            return jsonify({"error": "Validation error", "message": str(e)}), 400
        except Exception as e:
            return jsonify({"error": "Internal server error", "message": str(e)}), 500
    return wrapper