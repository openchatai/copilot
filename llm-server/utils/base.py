import hashlib
import os
import secrets
import string

import requests
from dotenv import load_dotenv

load_dotenv()


def generate_random_token(length: int = 16):
    """
    Generates a random token of specified length.

    Args:
        length (int): Length of the token to be generated. Default is 16.

    Returns:
        str: A random token string.
    """
    characters = string.ascii_letters + string.digits
    token = "".join(secrets.choice(characters) for i in range(length))
    return token


def resolve_abs_local_file_path_from(filename: str):
    return "shared_data/" + filename


def generate_random_hash():
    # Generate a random string
    random_string = secrets.token_hex(16)

    # Create a hash object (you can use sha256, sha512 or any other algorithm)
    hash_object = hashlib.sha256()

    # Update the hash object with the bytes of the random string
    hash_object.update(random_string.encode())

    # Get the hexadecimal representation of the hash
    hash_hex = hash_object.hexdigest()

    return hash_hex
