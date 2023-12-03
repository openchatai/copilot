import logging
import json
from typing import Optional, Any


class CustomJSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "loc": f"{record.name.replace('.', '/')}.py:{record.lineno}",
            "extra": record.__dict__.get("extra", {}),
        }
        return json.dumps(log_record)


class CustomLogger:
    def __init__(
        self,
        module_name: str = __name__,
        level: int = logging.INFO,
    ) -> None:
        self.logger = logging.getLogger(module_name)
        self.logger.setLevel(level)

        formatter = CustomJSONFormatter()
        log_handler = logging.StreamHandler()
        log_handler.setFormatter(formatter)
        self.logger.addHandler(log_handler)

    def log(
        self,
        level: int,
        message: str,
        extra: Optional[Any] = None,
    ) -> None:
        if extra is not None:
            if not isinstance(extra, dict):
                extra = {"non_dict_extra": extra}
        else:
            extra = {}

        self.logger.log(level, message, extra=extra)

    def info(
        self,
        message: str,
        extra: Optional[Any] = None,
    ) -> None:
        self.log(logging.INFO, message, extra)

    def warn(
        self,
        message: str,
        extra: Optional[Any] = None,
    ) -> None:
        self.log(logging.WARNING, message, extra)

    def error(
        self,
        message: str,
        extra: Optional[Any] = None,
    ) -> None:
        self.log(logging.ERROR, message, extra)

    def debug(
        self,
        message: str,
        extra: Optional[Any] = None,
    ) -> None:
        self.log(logging.DEBUG, message, extra)
