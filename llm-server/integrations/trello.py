from typing import Any, Dict, Optional


# Additionally allow users to select one board in which they are working, and refresh state only for that board to minimize api calls
def process_state(
    headers: Dict[str, Any], selected_board_id: Optional[str] = None
) -> Dict[str, Any]:
    import requests

    state: Dict[str, Any] = {
        "appId": "trello",
        "appName": "Trello",
        "description": "Given below is an array of objects with boards and list entities. You will find the listId and boardId.",
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
                "train": True,
            },
            "cards": {
                "endpoint": "https://api.trello.com/1/lists/{{listId}}/cards",
                "dataSource": "Get Cards",
                "data": [],
                "train": True,
            },
        },
        "relationships": [
            {"from": "board", "to": "lists", "type": "has"},
            {"from": "lists", "to": "cards", "type": "has"},
        ],
    }

    # Step 1: Get the list of boards
    boards_endpoint = state["entities"]["boards"]["endpoint"]
    response = requests.get(boards_endpoint, headers=headers)
    boards_data = response.json()

    boards_mapped = []
    for board in boards_data["boards"]:
        board_id = board["id"]
        board_name = board["name"]
        board_info = {"boardId": board_id, "name": board_name}

        # Step 2: Get the lists for the current board
        if not selected_board_id or (
            selected_board_id and selected_board_id == board_id
        ):
            lists_endpoint = state["entities"]["lists"]["endpoint"].replace(
                "{{boardId}}", board_id
            )
            response = requests.get(lists_endpoint, headers=headers)
            lists_data = response.json()

            lists_mapped = []
            for l in lists_data:
                list_id = l["id"]
                list_name = l["name"]
                list_info = {"listId": list_id, "listName": list_name, "cards": []}

                # Step 3: Get the cards for the current list
                cards_endpoint = state["entities"]["cards"]["endpoint"].replace(
                    "{{listId}}", list_id
                )
                response = requests.get(cards_endpoint, headers=headers)
                cards_data = response.json()

                for card in cards_data:
                    card_name = card["name"]
                    card_id = card["id"]
                    list_info["cards"].append(
                        {"cardName": card_name, "cardId": card_id}
                    )

                lists_mapped.append(list_info)

            board_info["lists"] = lists_mapped
        boards_mapped.append(board_info)

    state["entities"]["boards"]["data"] = boards_mapped

    return {"state": state["entities"]["boards"]["data"]}
