import os
from flask import Flask
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.util.http import get_excluded_urls
from opentelemetry import trace

# setup environment variables
os.environ["OTEL_PYTHON_FLASK_EXCLUDED_URLS"] = "client/.*/info,healthcheck"
os.environ["OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_REQUEST"] = (
    "content-type,custom_request_header"
)
os.environ["OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SERVER_RESPONSE"] = (
    "content-type,custom_response_header"
)
os.environ["OTEL_INSTRUMENTATION_HTTP_CAPTURE_HEADERS_SANITIZE_FIELDS"] = (
    ".*session.*,set-cookie"
)


def request_hook(span, environ):
    if span and span.is_recording():
        span.set_attribute("custom_user_attribute_from_request_hook", "some-value")


def response_hook(span, status, response_headers):
    if span and span.is_recording():
        span.set_attribute("custom_user_attribute_from_response_hook", "some-value")


def setup_telemetry(app: Flask):
    trace.set_tracer_provider(TracerProvider())
    excluded_urls = get_excluded_urls("client/.*/info,healthcheck")

    FlaskInstrumentor().instrument_app(
        app,
        excluded_urls=excluded_urls,
        enable_commenter=True,
        commenter_options={"framework": True, "route": True, "controller": True},
    )

    FlaskInstrumentor().instrument(
        request_hook=request_hook, response_hook=response_hook
    )
