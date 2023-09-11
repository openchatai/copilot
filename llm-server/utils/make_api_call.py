import requests
from typing import Any, Dict
from requests import Response


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
    request_type: str,
    url: str,
    body: Dict[str, Any] = {},
    params: Dict[str, Any] = {},
    headers: Dict[str, Any] = {},
) -> Response:
    try:
        # Create a session and configure it with headers
        url = replace_url_placeholders(url, params)
        session = requests.Session()

        # Add the "Content-Type" header with the value "application/json" to the headers
        headers["Content-Type"] = "application/json"

        if headers:
            session.headers.update(headers)

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
        print(f"An error occurred: {e}")
        raise (e)
