import os
import sentry_sdk

dsn = os.getenv("SENTRY_DSN")


class SilentException:
    @staticmethod
    def capture_exception(event, **kwargs):
        with sentry_sdk.configure_scope() as scope:
            scope.set_extra("extra_info", kwargs)
            # Log to Sentry if configured
            sentry_sdk.capture_exception(event)
            scope.clear()
