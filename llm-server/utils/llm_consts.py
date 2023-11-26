from flask import Request


X_CONSUMER_USERNAME = "X-CONSUMER-USERNAME"


def get_username_from_request(request: Request):
    return request.headers.get(X_CONSUMER_USERNAME) or "guest@opencopilot.so"
