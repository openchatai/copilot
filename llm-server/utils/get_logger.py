import os
import logging
import sentry_sdk
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(
    traces_sample_rate=1.0,
    profiles_sample_rate=1.0,
    integrations=[CeleryIntegration(propagate_traces=True)],
)

dsn = os.getenv("SENTRY_DSN")

logging.basicConfig(level=logging.INFO, format="%(message)s")


class CustomLogger:
    def __init__(self, module_name: str = __name__, level: int = logging.INFO):
        self.logger = logging.getLogger(module_name)
        self.logger.setLevel(level)

    def log(self, level, event, error=None, **kwargs):
        with sentry_sdk.configure_scope() as scope:
            exc_info = kwargs.pop("exc_info", None)
            scope.set_extra("extra_info", kwargs)
            # Log to Sentry if configured
            if dsn is not None and error is not None:
                sentry_sdk.capture_exception(error)
            elif dsn is not None:
                sentry_sdk.capture_message(event, level=level, scope=scope)

            scope.clear()

        self.logger.log(level, event, exc_info=exc_info, extra=kwargs)

    def info(self, event, **kwargs):
        self.log(logging.INFO, event, error=None, **kwargs)

    def warn(self, event, **kwargs):
        self.log(logging.WARNING, event, error=None, **kwargs)

    def error(self, event, error=Exception("custom_error"), **kwargs):
        self.log(logging.ERROR, event, error, **kwargs)

    def debug(self, event, **kwargs):
        self.log(logging.DEBUG, event, error=None, **kwargs)
