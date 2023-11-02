from typing import Dict, Any, Optional
import requests


from typing import Dict, Any
import requests


def process_state(headers: Dict[str, Any]) -> Dict[str, Any]:
    state: Dict[str, Any] = {
        "appId": "trello",
        "appName": "Trello",
        "description": "Given below is an array of objects with boards, lists, and cards entities. You will find the boardId, boardName, listId, listName, cardId, and cardName.",
        "entities": {
            "data": [],
        },
    }

    # Step 1: Get the list of boards
    boards_endpoint = "https://api.trello.com/1/members/me?boards=open"
    response = requests.get(boards_endpoint, headers=headers)
    boards_data = response.json()

    for board in boards_data["boards"]:
        board_id = board["id"]
        board_name = board["name"]

        lists_endpoint = f"https://api.trello.com/1/boards/{board_id}/lists"
        response = requests.get(lists_endpoint, headers=headers)
        lists_data = response.json()

        for l in lists_data:
            list_id = l["id"]
            list_name = l["name"]

            # Append the list information to the state's "entities" dictionary
            state["entities"]["data"].append(
                {
                    "boardId": board_id,
                    "boardName": board_name,
                    "listId": list_id,
                    "listName": list_name,
                }
            )

            # Step 3: Get the cards for the current list
            cards_endpoint = f"https://api.trello.com/1/lists/{list_id}/cards"
            response = requests.get(cards_endpoint, headers=headers)
            cards_data = response.json()

            for card in cards_data:
                card_id = card["id"]
                card_name = card["name"]

                # Append the card information to the state's "entities" dictionary
                state["entities"]["data"].append(
                    {
                        "boardId": board_id,
                        "boardName": board_name,
                        "listId": list_id,
                        "listName": list_name,
                        "cardId": card_id,
                        "cardName": card_name,
                    }
                )

    return state
