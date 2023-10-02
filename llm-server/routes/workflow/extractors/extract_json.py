import re
import json
from typing import Optional, Dict, List, Union

JsonData = Union[dict, list]


def extract_json_payload(
    input_string: str,
) -> Optional[
    Union[Dict[str, List[Union[str, Dict[str, Union[str, int]]]]], List[str]]
]:
    # Replace single quotes with double quotes
    input_string = re.sub(r"'", '"', input_string)

    match = re.findall(r"{[^{}]*}|\[[^\[\]]*\]", input_string)

    try:
        return json.loads(match[0]) if match else None
    except json.JSONDecodeError:
        return None
