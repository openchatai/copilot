import re
import json
from custom_types.t_json import JsonData
from typing import Optional


def extract_json_payload(
    input_string: str,
) -> Optional[JsonData]:
    # Remove all whitespace characters
    input_string = re.sub(r"\s", "", input_string)

    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)
    return json.loads(match[0]) if match else None
