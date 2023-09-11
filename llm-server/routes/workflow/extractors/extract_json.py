import re
import json
from typing import Optional, Union

JsonData = Union[dict, list]


def extract_json_payload(input_string: str) -> Optional[JsonData]:
    # Remove all whitespace characters
    input_string = re.sub(r"\s", "", input_string)

    # Replace single quotes with double quotes
    input_string = re.sub(r"'", '"', input_string)

    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)

    try:
        return json.loads(match[0]) if match else None
    except json.JSONDecodeError:
        return None
