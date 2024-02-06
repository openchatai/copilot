from typing import Any, Dict, NamedTuple
import json
import aiohttp
from copilot_exceptions.api_call_failed_exception import APICallFailedException
from custom_types.response_dict import ApiRequestResult

from utils.get_logger import CustomLogger

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


async def make_api_request(
    method: str,
    endpoint: str,
    body_schema: Any,
    path_params: Dict[str, str],
    query_params: Dict[str, str],
    headers: Any,
) -> dict[str, Any]:
    url = ""
    response = None
    try:
        logger.info(
            "MAKING_API_REQUEST",
            method=method,
            endpoint=endpoint,
            body=body_schema,
            path_param=path_params,
            query_param=query_params,
            headers=headers,
        )

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
                async with session.get(url, params=query_params, timeout=10) as resp:
                    response = await resp.json()
            elif method == "POST":
                async with session.post(
                    url, json=body_schema, params=query_params, timeout=10
                ) as resp:
                    response = await resp.json()
            elif method == "PUT":
                async with session.put(
                    url, json=body_schema, params=query_params, timeout=10
                ) as resp:
                    response = await resp.json()
            elif method == "DELETE":
                async with session.delete(url, params=query_params, timeout=10) as resp:
                    response = await resp.json()
            else:
                raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

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
        logger.error(
            "API request failed",
            error=e,
            headers=headers,
            url=url,
            params=path_params,
            query_params=query_params,
            method=method,
            body=body_schema,
        )

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
