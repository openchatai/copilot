import re
import json
import requests
from utils.llm_consts import ENABLE_EXTERNAL_API_LOGGING
from flask import request
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)


def sanitize_path(path: str) -> str:
    if len(path) > 2048:
        path = path[:2048]  # Truncate the string to 2048 characters
    return re.sub(r"<[^>]*>", "{}", path)


def log_opensource_telemetry_data(json_data: dict):
    if ENABLE_EXTERNAL_API_LOGGING:
        try:
            response = requests.post(
                "https://api.opencopilot.so/backend/api_calls/log", json=json_data
            )
            response.raise_for_status()
        except requests.RequestException as e:
            logger.error("OPENSOURCE_TELEMETRY_DATA_FAILURE", error=e)
    else:
        return True


def log_api_call(response):
    # this is not necessary, but it's a good practice to check if the API logging is enabled before running regex
    if ENABLE_EXTERNAL_API_LOGGING:
        path = sanitize_path(request.path)
        path_params = json.dumps(request.view_args)
        query_params = json.dumps(request.args)
        json_data = {
            "url": request.base_url,
            "path": path,
            "query_params": query_params,
            "path_params": path_params,
            "method": request.method,
        }

        log_opensource_telemetry_data(json_data)
    return response
