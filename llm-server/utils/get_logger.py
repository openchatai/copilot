import logging
import json
from typing import Mapping, Any
from pythonjsonlogger.jsonlogger import JsonFormatter


class CustomJSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_record = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "message": record.getMessage(),
            "loc": f"{record.name.replace('.', '/')}.py:{record.lineno}",
            "extra": record.__dict__.get("extra", {}),
        }
        return json.dumps(log_record, ensure_ascii=False)


class CustomLogger:
    def __init__(
        self,
        module_name: str = __name__,
        level: int = logging.INFO,
    ) -> None:
        self.logger = logging.getLogger(module_name)
        self.logger.setLevel(level)

        formatter = JsonFormatter()
        log_handler = logging.StreamHandler()
        log_handler.setFormatter(formatter)
        self.logger.addHandler(log_handler)

    def log(
        self,
        level: int,
        message: str,
        extra: Mapping[str, object] = {},
        exc_info: bool = False,
    ) -> None:
        self.logger.log(level, msg=message, extra=extra, exc_info=exc_info)

    def info(
        self,
        message: str,
        extra: Mapping[str, object] = {},
    ) -> None:
        self.log(logging.INFO, message, extra)

    def warn(
        self,
        message: str,
        extra: Mapping[str, object] = {},
    ) -> None:
        self.log(logging.WARNING, message, extra)

    def error(
        self,
        message: str,
        extra: Mapping[str, object] = {},
    ) -> None:
        self.log(logging.ERROR, message, extra, exc_info=True)

    def debug(
        self,
        message: str,
        extra: Mapping[str, object] = {},
    ) -> None:
        self.log(logging.DEBUG, message, extra)
