import json
import dill, requests

from utils.db import Database
from bson import ObjectId
from typing import Any, Dict, Optional

db_instance = Database()
mongo = db_instance.get_db()


def process_state(app: str, headers: Dict[str, Any]) -> Optional[str]:
    # new app or user didn't define app because they are using an older version of the frontend
    if app == None:
        return None

    _state = mongo.integrations.find_one({"app": app})
    state = dill.loads(_state["process_state"])(headers)

    # should return {"entities": [Array], description: "App description for alignment"}
    return json.dumps(state, separators=(",", ":"))
