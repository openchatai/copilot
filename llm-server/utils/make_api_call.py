from typing import Any, Dict
import csv
from io import StringIO
import json
from copilot_exceptions.api_call_failed_exception import APICallFailedException
from utils.get_logger import SilentException
import httpx


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
        query_params = {**query_params, **extra_params}
        endpoint = replace_url_placeholders(endpoint, path_params)

        url: str = endpoint
        async with httpx.AsyncClient() as client:
            headers["Content-Type"] = "application/json"

            if headers:
                client.headers.update(headers)

            if method == "GET":
                response = await client.get(url, params=query_params, timeout=30)
            elif method == "POST":
                response = await client.post(
                    url, json=body_schema, params=query_params, timeout=30
                )
            elif method == "PUT":
                response = await client.put(
                    url, json=body_schema, params=query_params, timeout=30
                )
            elif method == "PATCH":
                response = await client.patch(
                    url, json=body_schema, params=query_params, timeout=30
                )
            elif method == "DELETE":
                response = await client.delete(url, params=query_params, timeout=30)
            else:
                raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

            if "text/csv" in response.headers["Content-Type"]:
                response_data = list(csv.DictReader(StringIO(response.text)))
            elif "application/json" in response.headers["Content-Type"]:
                response_data = response.json()
            else:
                response_data = {
                    "content_type": response.headers["Content-Type"],
                    "response_text": response.text,
                }

        return {
            "method": method,
            "endpoint": endpoint,
            "body": body_schema,
            "path_param": path_params,
            "query_param": query_params,
            "response": response_data,
            "error": None,
        }
    except httpx.HTTPError as e:
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
