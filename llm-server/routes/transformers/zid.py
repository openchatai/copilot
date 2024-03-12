from concurrent.futures import ThreadPoolExecutor

import requests
from flask import jsonify, Blueprint, request
from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db import engine
from utils.get_logger import SilentException

import json
import requests
import concurrent.futures

transformers_workflow = Blueprint("transformers", __name__)

Session = sessionmaker(bind=engine)
request_session = requests.Session()


def make_request_zid(url, data, params={}):

    url = f'{url}?_token={params.get("_token")}&lang=ar'

    headers = {
        "Cookie": "session=f9c5da58-578c-4b27-8a96-73b1bcb34d5d",
        "Content-Type": "application/json",
    }

    data = json.dumps(data)

    try:
        response = requests.post(url, headers=headers, data=data)
        response.raise_for_status()  # This will raise an exception for HTTP error codes
        try:
            json_data = response.json()
            return json_data  # Or process the JSON data as needed
        except ValueError as e:  # includes simplejson.decoder.JSONDecodeError
            raise e
    except Exception as e:
        SilentException.capture_exception(e)
        return {
            "error": "Error in making request to Zid analytics service, please inform the user that the service is currently unavailable, {}".format(
                str(e)
            ),
        }


def transform_and_minimize_response_zid(data):
    # if simplified_data is empty, return the original data
    if not data:
        return {
            "error": "No data available at the moment, becuase the service is currently unavailable"
        }

    return data


@transformers_workflow.route("/zid/get-analytics-data", methods=["POST"])
def aggregate_data_zid():
    body = request.json
    headers = request.headers
    token = headers.get("token")

    urls = [
        "https://web.zid.sa/_analytics/api/orders",
        "https://web.zid.sa/_analytics/api/marketing",
        "https://web.zid.sa/_analytics/api/marketing_cart_sales",
        "https://web.zid.sa/_analytics/api/marketing_abandoned_carts",
        "https://web.zid.sa/_analytics/api/marketing_top_cities",
        "https://web.zid.sa/_analytics/api/marketing_top_customers",
        "https://web.zid.sa/_analytics/api/marketing_top_products",
        "https://web.zid.sa/_analytics/api/products",
    ]

    with ThreadPoolExecutor() as executor:
        futures = [
            executor.submit(
                make_request_zid,
                url,
                body,
                {"_token": token, "lang": "ar"},
            )
            for url in urls
        ]
        results = [future.result() for future in futures]

    combined_data = {f"response_{i}": data for i, data in enumerate(results)}
    return jsonify(transform_and_minimize_response_zid(combined_data))


### ###
### GAME BALL
### ###


@transformers_workflow.route("/gameball", methods=["post"])
def aggregate_data_gameball():
    try:
        request_data = request.get_json()
        if "from" in request_data and "to" in request_data:
            # Extract the dynamic date range from the request data
            from_date = request_data["from"]
            to_date = request_data["to"]

            # Define a list of analytics groups to fetch data for
            analytics_groups = [
                "ActivePlayers",
                "CouponSales",
                "OrderSales",
                "Sales",
                "UtmSales",
            ]

            # Initialize an empty list to store curl commands with dynamic date range
            curl_commands = []

            # Generate curl commands for each analytics group with dynamic date range
            for group in analytics_groups:
                curl_command = {
                    "include_guest": "false",
                    "gbEnabled": "true",
                    "analytics_group": group,
                    "from": from_date,
                    "to": to_date,
                }
                curl_commands.append(curl_command)

            aggregated_data = fetch_data_paralle_gameballl(curl_commands)
            return jsonify(aggregated_data)
        else:
            return (
                jsonify({"error": 'Missing "from" or "to" date in request data'}),
                400,
            )
    except Exception as e:
        return jsonify({"error": "Failed while aggregating gameball data"}), 500


def make_request_gameball(curl_params):
    response = requests.get(
        "https://api.gameball.co/analytics/api/v1.0/analytics/metric",
        params=curl_params,
        headers={
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBZG1pbiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJ0ZXN0Z2FtZWJhbGxhY2N0QGdtYWlsLmNvbSIsIklzQWRtaW4iOiJGYWxzZSIsIkZpcnN0TmFtZSI6InRlc3QiLCJMYXN0TmFtZSI6InRlc3QiLCJVc2VySWQiOiJkMmQ0OTFhZi1lMDg2LTRhOGUtOWM3Yi1iZGNhNjEyNjM1MzUiLCJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjgzMzEiLCJleHAiOjE3MDU2MDI5NjYsImlzcyI6IkF1dGguR2FtZUJhbGwiLCJhdWQiOiJHYW1lQmFsbCJ9.SNSr5UDvXWpHm8fneeHPVNptterQjVxN5N13guwkLhg"
        },
    )
    return response.json()


def fetch_data_paralle_gameballl(curl_commands):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        responses = list(executor.map(make_request_gameball, curl_commands))

    # Merge the responses into a single response dictionary
    merged_response = {"responses": responses}
    return merged_response
