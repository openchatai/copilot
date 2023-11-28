from flask import Request
import os


X_CONSUMER_USERNAME = "X-CONSUMER-USERNAME"
EXPERIMENTAL_FEATURES_ENABLED = os.getenv("EXPERIMENTAL_FEATURES_ENABLED", "NO")


def get_username_from_request(request: Request):
    return request.headers.get(X_CONSUMER_USERNAME) or "guest@opencopilot.so"
