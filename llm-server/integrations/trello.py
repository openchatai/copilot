from typing import Any, Dict, Optional
import requests
import dill
from database import Database
from dotenv import load_dotenv

load_dotenv("../.env")
db_instance = Database()
mongo = db_instance.get_db()


def process_state(headers: Dict[str, Any]) -> Dict[str, Any]:
    state: Dict[str, Any] = {
        "appId": "trello",
        "appName": "Trello",
        "description": "App description (Helps in alignining the bot)",
        "entities": {
            "boards": {
                "endpoint": "https://api.trello.com/1/members/me?boards=open",
                "dataSource": "Get boards",
                "data": [],
                "train": False,
            },
            "lists": {
                "endpoint": "https://api.trello.com/1/boards/{{boardId}}/lists",
                "dataSource": "Get Lists",
                "data": [],
                "train": True,  # this will be used when calling the llm
            },
        },
        "relationships": [{"from": "board", "to": "lists", "type": "has"}],
    }

    boards_endpoint = state["entities"]["boards"]["endpoint"]
    response = requests.get(boards_endpoint, headers=headers)
    boards_data = response.json()

    # Iterate over each board and get lists
    for board in boards_data["boards"]:
        board_id = board["id"]
        lists_endpoint = state["entities"]["lists"]["endpoint"].replace(
            "{{boardId}}", board_id
        )

        response = requests.get(lists_endpoint, headers=headers)
        data = response.json()

        # Use the parse and transform functions for the "lists" entity
        parsed_data = [list_item for list_item in data if not list_item["closed"]]
        transformed_data = [
            {"idList": item["id"], "name": item["name"], "idBoard": item["idBoard"]}
            for item in parsed_data
        ]

        # Append the transformed data to the "data" array in the "lists" entity
        state["entities"]["lists"]["data"].extend(transformed_data)

    return state


if __name__ == "__main__":
    mongo.integrations.insert_one(
        {"function": dill.dumps(process_state), "app": "trello"}
    )
