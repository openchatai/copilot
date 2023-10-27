import requests
from typing import Dict, Any, List, Optional


def get_users(headers: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
    url = "https://slack.com/api/users.list"
    r = requests.get(url, headers=headers)
    data = r.json()
    users = []
    for u in data["members"]:
        user_id = u["id"]
        user_name = u["name"]
        user = {"id": user_id, "name": user_name}
        users.append(user)
    return users


def get_channels(headers: Dict[str, Any]) -> Optional[List[Dict[str, Any]]]:
    url = "https://slack.com/api/conversations.list"
    r = requests.get(url, headers=headers)

    if r.status_code != 200:
        print(f"Error: {r.status_code} - {r.text}")
        return None

    data = r.json()
    channels = data["channels"]

    channel_info = []
    for c in channels:
        channel_id = c["id"]
        channel_name = c["name"]
        channel_topic = c["topic"]["value"]
        channel_meta = {
            "channel_id": channel_id,
            "channel_name": channel_name,
            "topic": channel_topic,
        }
        channel_info.append(channel_meta)

    return channel_info


def process_state(headers: Dict[str, Any]) -> Dict[str, Any]:
    channels = get_channels(headers)
    users = get_users(headers)

    return {"channels": channels, "users": users}
