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
    method,
    endpoint,
    body_schema,
    path_params,
    query_params,
    headers,
    servers,
) -> Response:
    try:
        endpoint = replace_url_placeholders(endpoint, path_params)
        url = servers[0] + endpoint
        # Create a session and configure it with headers
        session = requests.Session()

        # Add the "Content-Type" header with the value "application/json" to the headers
        headers["Content-Type"] = "application/json"

        if headers:
            session.headers.update(headers)
        # Perform the HTTP request based on the request type
        if method == "GET":
            response = session.get(url, params=query_params)
        elif method == "POST":
            response = session.post(url, json=body_schema, params=query_params)
        elif method == "PUT":
            response = session.put(url, json=body_schema, params=query_params)
        elif method == "DELETE":
            response = session.delete(url, params=query_params)
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
                "params": path_params,
                "query_params": query_params,
                "method": method,
            },
        )
        raise (e)
