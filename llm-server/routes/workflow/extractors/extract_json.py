import re
import json
from typing import Optional, Dict, List, Union

JsonData = Union[dict, list]


def extract_json_payload(
    input_string: str,
) -> Optional[
    Union[Dict[str, List[Union[str, Dict[str, Union[str, int]]]]], List[str]]
]:
    # Replace single quotes with double quotes while escaping double quotes and single quotes within strings
    input_string = re.sub(r"'(.*?[^\\])'", r'"\1"', input_string)

    match = re.findall(r"{[^{}]*}|\[[^\[\]]*\]", input_string)

    try:
        return json.loads(match[0]) if match else None
    except json.JSONDecodeError:
        return None
