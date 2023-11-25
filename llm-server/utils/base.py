import secrets
import string


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
