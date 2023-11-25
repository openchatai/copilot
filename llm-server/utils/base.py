import secrets
import string
from typing import Any

from langchain.chains.openai_functions.openapi import get_openapi_chain
from langchain.utilities.openapi import OpenAPISpec


def try_to_match_and_call_api_endpoint(
        swagger_spec: OpenAPISpec, text: str, headers: Any
) -> str:
    openapi_call_chain = get_openapi_chain(swagger_spec, verbose=True, headers=headers)

    return openapi_call_chain.run(text)


def generate_random_token(length=16):
    """
    Generates a random token of specified length.

    Args:
        length (int): Length of the token to be generated. Default is 16.

    Returns:
        str: A random token string.
    """
    characters = string.ascii_letters + string.digits
    token = ''.join(secrets.choice(characters) for i in range(length))
    return token

