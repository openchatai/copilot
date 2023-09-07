import json
import requests
from langchain.utilities.openapi import OpenAPISpec
from typing import Tuple, Union


def fetch_swagger_spec(
    swagger_url: Union[str, None] = None
) -> Tuple[Union[str, OpenAPISpec], int]:
    if not swagger_url:
        return json.dumps({"error": "swagger_url is required"}), 400

    if swagger_url.startswith("https://"):
        full_url = swagger_url
        response = requests.get(full_url)
        if response.status_code == 200:
            swagger_text = response.text
        else:
            return json.dumps({"error": "Failed to fetch Swagger content"}), 500
    else:
        full_url = "/app/shared_data/" + swagger_url
        try:
            with open(full_url, "r") as file:
                swagger_text = file.read()
        except FileNotFoundError:
            return json.dumps({"error": "File not found"}), 404

    return OpenAPISpec.from_text(swagger_text), 200
