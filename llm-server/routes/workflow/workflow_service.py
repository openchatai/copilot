import os
from typing import Dict, Optional, Union
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

SCORE_THRESHOLD = float(os.getenv("SCORE_THRESOLD", 0.88))


def get_valid_url(
    api_payload: Dict[str, Union[str, None]], server_base_url: Optional[str]
) -> str:
    if "endpoint" in api_payload:
        endpoint = api_payload["endpoint"]

        # Check if path is a valid URL
        if endpoint and endpoint.startswith(("http://", "https://")):
            return endpoint
        elif server_base_url and server_base_url.startswith(("http://", "https://")):
            # Append server_base_url to endpoint
            return f"{server_base_url}{endpoint}"
        else:
            raise ValueError("Invalid server_base_url")
    else:
        raise ValueError("Missing path parameter")
