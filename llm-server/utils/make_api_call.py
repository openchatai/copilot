import requests
from typing import Any, Dict, Optional, List
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
    method: str,
    endpoint: str,
    body_schema: Optional[Dict[str, Any]],
    path_params: Optional[Dict[str, str]],
    query_params: Optional[Dict[str, Any]],
    headers: Dict[str, str],
    servers: List[str],
) -> Response:
    url = servers[0] + endpoint
    try:
        endpoint = replace_url_placeholders(endpoint, path_params or {})
        print(f"Endpoint: {endpoint}")

        session = requests.Session()
        headers["Content-Type"] = "application/json"

        if headers:
            session.headers.update(headers)

        if method == "GET":
            response = session.get(url, params=query_params or {})
        elif method == "POST":
            response = session.post(url, json=body_schema, params=query_params or {})
        elif method == "PUT":
            response = session.put(url, json=body_schema, params=query_params or {})
        elif method == "DELETE":
            response = session.delete(url, params=query_params or {})
        else:
            raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

        response.raise_for_status()

        return response

    except requests.exceptions.RequestException as e:
        logger.error(
            "API request failed",
            exc_info=e,
            extra={
                "headers": headers,
                "url": url,
                "params": path_params or {},
                "query_params": query_params or {},
                "method": method,
            },
        )
        raise e
