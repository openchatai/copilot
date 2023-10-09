import json
import pickle, requests

from utils.db import Database
from bson import ObjectId, json_util

db_instance = Database()
mongo = db_instance.get_db()


def process_state(state_id: str) -> None:
    state = mongo.integrations.find_one({"_id": ObjectId(state_id)})

    for entity_name, entity in state["entities"].items():
        parse_fn = pickle.loads(entity["parseFn"])
        transform_fn = pickle.loads(entity["transformFn"])

        response = requests.get(entity["endpoint"])
        data = response.json()

        parsed_data = parse_fn(data)
        transformed_data = transform_fn(parsed_data)

        state["entities"][entity_name]["data"] = transformed_data

    mongo.integrations.update_one(
        {"_id": ObjectId(state_id)}, {"$set": transformed_data}, True
    )
