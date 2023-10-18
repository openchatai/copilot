from typing import Dict, Any


# full json is api response, partial_json is the final result we are expecting, we have to define partial json for all endpoints, take partial json from apis/<slack>/<api_name>/<method> and then pass it to this function
def transform_response(full_json: Dict[str, Any], partial_json: Dict[str, Any]) -> Any:
    def recursive_filter(
        full: Dict[str, Any], partial: Dict[str, Any]
    ) -> Dict[str, Any]:
        filtered: Dict[str, Any] = {}
        if isinstance(full, dict):
            for key in partial:
                if key in full:
                    filtered[key] = recursive_filter(full[key], partial[key])
        elif isinstance(full, list):
            filtered = [recursive_filter(item, partial[0]) for item in full]
        else:
            filtered = full
        return filtered

    return recursive_filter(full_json, partial_json)
    # Test flatten later, if the response is not as expected
    # return json.dumps(flatten(recursive_filter(full_json, partial_json)))


# Example usage
# full_json = {
#     "ok": True,
#     "members": [
#         {
#             "id": "USLACKBOT",
#             "team_id": "T05RG4D29C6",
#             "name": "slackbot",
#             "deleted": False,
#             "color": "757575",
#             "real_name": "Slackbot",
#             "tz": "America\\/Los_Angeles",
#             "tz_label": "Pacific Daylight Time",
#             "tz_offset": -25200,
#             "profile": {
#                 "title": "",
#                 "phone": "",
#                 "skype": "",
#                 "real_name": "Slackbot",
#                 "real_name_normalized": "Slackbot",
#                 "display_name": "Slackbot",
#                 "display_name_normalized": "Slackbot",
#                 "fields": {},
#                 "status_text": "",
#                 "status_emoji": "",
#                 "status_emoji_display_info": [],
#                 "status_expiration": 0,
#                 "avatar_hash": "sv41d8cd98f0",
#                 "always_active": True,
#                 "first_name": "slackbot",
#                 "last_name": "",
#                 "image_24": "https:\\/\\/a.slack-edge.com\\/80588\\/img\\/slackbot_24.png",
#                 "image_32": "https:\\/\\/a.slack-edge.com\\/80588\\/img\\/slackbot_32.png",
#                 "image_48": "https:\\/\\/a.slack-edge.com\\/80588\\/img\\/slackbot_48.png",
#                 "image_72": "https:\\/\\/a.slack-edge.com\\/80588\\/img\\/slackbot_72.png",
#                 "image_192": "https:\\/\\/a.slack-edge.com\\/80588\\/marketing\\/img\\/avatars\\/slackbot\\/avatar-slackbot.png",
#                 "image_512": "https:\\/\\/a.slack-edge.com\\/80588\\/img\\/slackbot_512.png",
#                 "status_text_canonical": "",
#                 "team": "T05RG4D29C6",
#             },
#             "is_admin": False,
#             "is_owner": False,
#             "is_primary_owner": False,
#             "is_restricted": False,
#             "is_ultra_restricted": False,
#             "is_bot": False,
#             "is_app_user": False,
#             "updated": 0,
#             "is_email_confirmed": False,
#             "who_can_share_contact_card": "EVERYONE",
#         },
#     ],
#     "cache_ts": 1697533241,
#     "response_metadata": {"next_cursor": ""},
# }

# partial_json = {
#     "members": [
#         {
#             "id": "USLACKBOT",
#             "team_id": "T05RG4D29C6",
#             "name": "slackbot",
#             "profile": {
#                 "title": "",
#             },
#         }
#     ],
# }

# filtered_json = transform_response(full_json, partial_json)

# print(filtered_json)
