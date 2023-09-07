import json
import requests
from langchain.utilities.openapi import OpenAPISpec
from typing import Tuple, Union


class FetchSwaggerSpecError(Exception):
    """Custom exception class for errors related to fetching Swagger specs."""

    def __init__(self, message: str):
        super().__init__(message)


def fetch_swagger_spec(swagger_url: Union[str, None] = None) -> OpenAPISpec:
    if not swagger_url:
        raise FetchSwaggerSpecError("swagger_url is required")

    if swagger_url.startswith("https://"):
        full_url = swagger_url
        response = requests.get(full_url)
        if response.status_code == 200:
            swagger_text = response.text
        else:
            raise FetchSwaggerSpecError("Failed to fetch Swagger content")
    else:
        full_url = "/app/shared_data/" + swagger_url
        try:
            with open(full_url, "r") as file:
                swagger_text = file.read()
        except FileNotFoundError:
            raise FetchSwaggerSpecError("File not found")

    return OpenAPISpec.from_text(swagger_text)
