import requests
import time
from typing import Dict, Any, List, Optional


from integrations.database import Database

db_instance = Database()
mongo = db_instance.get_db()


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
    # Get current timestamp
    now = time.time()

    # Try to find cached data from MongoDB
    cache = mongo.app_cache.find_one({"app": "slack"}, {"_id": 0})

    # Check if cache exists and is less than 2 minutes old
    if cache and now - cache["timestamp"] < 600:
        print("Returning cached data")
        return cache

    # Cache miss - fetch fresh data
    print("Fetching fresh data")
    channels = get_channels(headers)
    users = get_users(headers)

    # Update cache object
    cache = {"app": "slack", "channels": channels, "users": users, "timestamp": now}

    # Insert into MongoDB
    mongo.app_cache.replace_one({"app": "slack"}, cache, upsert=True)

    return {"channels": channels, "users": users}
