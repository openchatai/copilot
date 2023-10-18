from typing import Dict, Any
import json
import os
import re


def load_config(app_name: str, operationId: str, method: str) -> Any:
    """Load the configuration for the given app name, operation ID and method.

    Args:
        app_name: Name of the app
        operationId: Operation ID for the config file
        method: HTTP method name (get, post, etc)

    Returns:
        The config data structure for the given operation and method.
    """

    current_dir = os.path.dirname(__file__)
    config_file = os.path.join(
        current_dir, f"transformers/{app_name}/operations/{operationId}.py"
    )

    with open(config_file, "r") as f:
        data = f.read()
        data = re.sub(r"\s+", "", data)  # Remove whitespace
        data = re.sub(r"\n", "", data)  # Remove newlines
        data = re.sub(r",(?=\s*?[{])", "", data)  # Remove extra commas
        data = re.sub(r",(?=\s*?})", "", data)  # Remove trailing commas
        f_data = json.loads(data)

    return f_data[method]


config = load_config("slack", "users_list", "get")
print(config)
