import re
import json
from typing import Any


def extract_json_payload(
    input_string: str,
) -> Any:
    match = re.findall(r"{[^{}]*}|\[[^\[\]]*\]", input_string)

    try:
        return json.loads(match[0]) if match else input_string
    except json.JSONDecodeError:
        return input_string
