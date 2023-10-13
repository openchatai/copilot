import json
from utils.db import Database
from typing import Any, Dict, Optional
import importlib

db_instance = Database()
mongo = db_instance.get_db()


def extract_data_property(obj: Any) -> Any:
    for key, value in obj.items():
        if "data" in value:
            obj[key] = {"data": value["data"]}
        else:
            obj.pop(key, None)

    return obj


def process_state(app: Optional[str], headers: Dict[str, Any]) -> Optional[str]:
    # new app or user didn't define app because they are using an older version of the frontend
    if app == None:
        return None

    processor = importlib.import_module(f"integrations.{app}")
    state = extract_data_property(processor.process_state(headers))
    return json.dumps(state, separators=(",", ":"))
