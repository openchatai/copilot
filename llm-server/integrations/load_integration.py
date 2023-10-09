import json
import os
import pickle
from pymongo import MongoClient


def process_app_folders(path):
    client = MongoClient()
    db = client["integrations"]

    for folder in os.listdir(path):
        state_file = os.path.join(path, folder, "state.json")
        func_file = os.path.join(path, folder, "functions.pkl")

        with open(state_file) as f:
            state = json.load(f)

        with open(func_file, "rb") as f:
            functions = pickle.load(f)

        for entity in state["entities"].values():
            if "transformFn" in entity:
                entity["transformFn"] = functions[entity["transformFn"]]

            if "parseFn" in entity:
                entity["parseFn"] = functions[entity["parseFn"]]

        db.integrations.update_one(
            {"appId": state["appId"]}, {"$set": state}, upsert=True
        )
