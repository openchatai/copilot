import requests
from typing import Any, Dict
from requests import Response
import logging

logger = logging.getLogger(__name__)


def replace_url_placeholders(url: str, values_dict: Dict[str, Any]) -> str:
    """
    Replace placeholders in a URL with values from a dictionary.

    Args:
    url (str): The URL containing placeholders.
    values_dict (dict): A dictionary containing key-value pairs for replacements.

    Returns:
    str: The URL with placeholders replaced by values.
    """
    for key, value in values_dict.items():
        placeholder = "{" + key + "}"
        if placeholder in url:
            url = url.replace(placeholder, str(value))
    return url


def make_api_request(
    endpoint: str,
    method: str,
    path_params: Dict[str, Any] = {},
    query_params: Dict[str, Any] = {},
    body_schema: Dict[str, Any] = {},
) -> Response:
    url = replace_url_placeholders(url, params)
    # Create a session and configure it with headers
    session = requests.Session()

    # Add the "Content-Type" header with the value "application/json" to the headers
    headers["Content-Type"] = "application/json"

    if headers:
        session.headers.update(headers)
    try:
        # Perform the HTTP request based on the request type
        if request_type.upper() == "GET":
            response = session.get(url, params=params)
        elif request_type.upper() == "POST":
            response = session.post(url, json=body, params=params)
        elif request_type.upper() == "PUT":
            response = session.put(url, json=body, params=params)
        elif request_type.upper() == "DELETE":
            response = session.delete(url, params=params)
        else:
            raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

        # Raise an exception for HTTP errors (4xx and 5xx)
        response.raise_for_status()

        return response

    except requests.exceptions.RequestException as e:
        logger.error(
            "API request failed",
            exc_info=e,
            extra={
                "headers": headers,
                "url": url,
                "params": params,
                "request_type": request_type,
            },
        )
        raise (e)
