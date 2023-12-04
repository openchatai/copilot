import structlog
import logging

structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.dict_tracebacks,
        structlog.processors.JSONRenderer(),
    ],
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)


class CustomLogger:
    def __init__(self, module_name: str = __name__, level: int = logging.INFO):
        self.logger = structlog.get_logger(module_name)
        logging.basicConfig(level=level, format="%(message)s")

    def log(self, level, event, **kwargs):
        self.logger.log(
            level,
            event=event,
            extra={k: v for k, v in kwargs.items() if k not in ("exc_info", "extra")},
            exc_info=kwargs.get("exc_info"),
        )

    def info(self, event, **kwargs):
        self.log(logging.INFO, event, **kwargs)

    def warn(self, event, **kwargs):
        self.log(logging.WARNING, event, **kwargs)

    def error(self, event, **kwargs):
        self.log(logging.ERROR, event, **kwargs)

    def debug(self, event, **kwargs):
        self.log(logging.DEBUG, event, **kwargs)
