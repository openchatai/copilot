from typing import Any, Dict
import csv
from io import StringIO
import json
import aiohttp
from copilot_exceptions.api_call_failed_exception import APICallFailedException
from utils.get_logger import SilentException


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


def serialize_booleans(data: Any) -> Any:
    if isinstance(data, bool):
        return str(data).lower()
    elif isinstance(data, dict):
        return {key: serialize_booleans(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [serialize_booleans(item) for item in data]
    else:
        return data


async def make_api_request(
    method: str,
    endpoint: str,
    body_schema: Any,
    path_params: Dict[str, str],
    query_params: Dict[str, str],
    headers: Any,
    extra_params: Dict[str, str],
) -> dict[str, Any]:
    url = ""
    if not extra_params:
        extra_params = {}
    response = None
    try:
        query_params = serialize_booleans({**query_params, **extra_params})
        endpoint = replace_url_placeholders(endpoint, path_params)

        url: str = endpoint
        # Create a session and configure it with headers
        async with aiohttp.ClientSession() as session:
            # Add the "Content-Type" header with the value "application/json" to the headers
            headers["Content-Type"] = "application/json"
            # headers.pop("X-Copilot", None)

            if headers:
                session.headers.update(headers)

            # Perform the HTTP request based on the request type
            if method == "GET":
                async with session.get(url, params=query_params, timeout=30) as resp:
                    response = await resp.text()
            elif method == "POST":
                async with session.post(
                    url, json=body_schema, params=query_params, timeout=30
                ) as resp:
                    response = await resp.text()
            elif method == "PUT":
                async with session.put(
                    url, json=body_schema, params=query_params, timeout=30
                ) as resp:
                    response = await resp.text()
            elif method == "PATCH":
                async with session.patch(
                    url, json=body_schema, params=query_params, timeout=30
                ) as resp:
                    response = await resp.text()
            elif method == "DELETE":
                async with session.delete(url, params=query_params, timeout=30) as resp:
                    response = await resp.text()
            else:
                raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

            # Check if the response is CSV
            if "text/csv" in resp.headers["Content-Type"]:
                # Parse CSV data
                response = list(csv.DictReader(StringIO(response)))
            elif "application/json" in resp.headers["Content-Type"]:
                # Parse JSON data
                response = await resp.json()
            else:
                # For other content types, return a structured response
                response = {
                    "content_type": resp.headers["Content-Type"],
                    "response_text": response,
                }

        return {
            "method": method,
            "endpoint": endpoint,
            "body": body_schema,
            "path_param": path_params,
            "query_param": query_params,
            "response": response,
            "error": None,
        }

    except aiohttp.ClientError as e:
        SilentException.capture_exception(e)

        raise APICallFailedException(
            json.dumps(
                {
                    "method": method,
                    "endpoint": endpoint,
                    "body": body_schema,
                    "path_param": path_params,
                    "query_param": query_params,
                    "response": str(response.text if response is not None else e),
                }
            )
        )
