import requests
from typing import Any, Dict
from requests import Response

from utils.get_logger import CustomLogger
from flask_socketio import emit

logger = CustomLogger(module_name=__name__)


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
    session_id: str,
) -> Response:
    url = ""
    try:
        endpoint = replace_url_placeholders(endpoint, path_params)
        url: str = servers[0] + endpoint
        # Create a session and configure it with headers
        session = requests.Session()

        # Add the "Content-Type" header with the value "application/json" to the headers
        headers["Content-Type"] = "application/json"

        if headers:
            session.headers.update(headers)
        # Perform the HTTP request based on the request type
        if method == "GET":
            response = session.get(url, params=query_params, timeout=10)
        elif method == "POST":
            response = session.post(
                url, json=body_schema, params=query_params, timeout=10
            )
        elif method == "PUT":
            response = session.put(
                url, json=body_schema, params=query_params, timeout=10
            )
        elif method == "DELETE":
            response = session.delete(url, params=query_params, timeout=10)
        else:
            raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

        # Raise an exception for HTTP errors (4xx and 5xx)
        emit(
            f"{session_id}_info", f"\nGot the following api response \n{response.text}"
        )
        response.raise_for_status()

        return response

    except requests.exceptions.RequestException as e:
        emit(f"{session_id}_info", str(e))
        logger.error(
            "API request failed",
            e=str(e),
            headers=headers,
            url=url,
            params=path_params,
            query_params=query_params,
            method=method,
        )
        raise (e)
