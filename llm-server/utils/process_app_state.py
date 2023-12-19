import json
from utils.db import NoSQLDatabase
from typing import Any, Dict, Optional
import importlib

db_instance = NoSQLDatabase()
mongo = db_instance.get_db()


# def extract_data_property(obj: Any) -> Any:
#     for key, value in obj.items():
#         if "data" in value:
#             obj[key] = {"data": value["data"]}
#         else:
#             obj.pop(key, None)

#     return obj


def process_state(app: Optional[str], headers: Dict[str, Any]) -> Optional[str]:
    if app is None:
        return None

    try:
        processor = importlib.import_module(f"integrations.{app}")
    except ModuleNotFoundError:
        return None

    state = processor.process_state(headers)
    return json.dumps(state, separators=(",", ":"))
