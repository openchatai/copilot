import json
import os
from typing import Any
from dotenv import load_dotenv
from database import Database
import dill


load_dotenv("../.env")
db_instance = Database()
mongo = db_instance.get_db()


def process_app_folder(folder_name: str, uid: str) -> None:
    current_file_path = os.path.dirname(os.path.abspath(__file__))

    state_file = os.path.join(current_file_path, folder_name, "state.json")
    functions_file = os.path.join(current_file_path, folder_name, "functions.py")
    with open(state_file) as f:
        state = json.load(f)

    functions: Any = {}
    with open(functions_file) as f:
        code = f.read()
        exec(code, functions)

    for entity in state["entities"].values():
        if "transformFn" in entity:
            entity["transformFn"] = dill.dumps(functions["transformFn"])
        if "parseFn" in entity:
            entity["parseFn"] = dill.dumps(functions["parseFn"])

    state["uid"] = uid
    mongo.integrations.insert_one(state)


if __name__ == "__main__":
    print("Enter folder path to scan:")
    path = input()

    print("Enter user's unique identifier")
    uid = input()

    process_app_folder(path, uid)
