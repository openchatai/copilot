from typing import Optional, Any
import json
import os


def load_json_config(app: Optional[str], operation_id: str) -> Optional[Any]:
    """Load the configuration for the given app and operation ID.

    Args:
        app: Name of the app
        operation_id: Operation ID for the config file

    Returns:
        The loaded config dict if found, else None
    """

    if not app:
        return None
    current_dir = os.path.dirname(__file__)
    config_file = os.path.join(
        current_dir, f"transformers/{app}/operations/{operation_id}.json"
    )

    if not os.path.exists(config_file):
        return None

    with open(config_file, "r") as f:
        data = json.load(f)

    return data
