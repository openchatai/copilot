import json
import dill, requests

from utils.db import Database
from bson import ObjectId
from typing import Any, Dict, Optional

db_instance = Database()
mongo = db_instance.get_db()


def process_state(state_id: Optional[str], headers: Dict[str, Any]) -> Optional[str]:
    if state_id == None:
        return None

    state = mongo.integrations.find_one({"_id": ObjectId(state_id)})

    for entity_name, entity in state["entities"].items():
        parse_fn = dill.loads(entity["parseFn"])
        transform_fn = dill.loads(entity["transformFn"])

        response = requests.get(entity["endpoint"], headers=headers)
        data = response.json()

        parsed_data = parse_fn(data)
        transformed_data = transform_fn(parsed_data)

        state["entities"][entity_name]["data"] = transformed_data

    res = mongo.integrations.update_one(
        {"_id": ObjectId(state_id)}, {"$set": state}, True
    )

    # @todo this can be made lose by passing state["entities"], for testing we will keep it strict
    return json.dumps(state["entities"][entity_name]["data"], separators=(",", ":"))
