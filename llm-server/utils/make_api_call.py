import requests

def make_api_request(request_type, url, body=None, params=None, query_params=None, headers=None):
    """
    Make an HTTP request to the specified URL with the given parameters.

    Args:
        request_type (str): The HTTP request type (GET, POST, PUT, DELETE, etc.).
        url (str): The URL of the API endpoint.
        body (dict, optional): The request body as a dictionary.
        params (dict, optional): The request parameters as a dictionary.
        query_params (dict, optional): The query parameters as a dictionary.
        headers (dict, optional): The request headers as a dictionary.

    Returns:
        requests.Response: The HTTP response object.
    Example:
        request_type = "GET"
        url = "https://example.com/api"
        body = {"key": "value"}
        params = {"param_key": "param_value"}
        query_params = {"query_key": "query_value"}
        headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}

        response = make_api_request(request_type, url, body, params, query_params, headers)
    """
    try:
        # Create a session and configure it with headers
        session = requests.Session()
        if headers:
            session.headers.update(headers)

        # Perform the HTTP request based on the request type
        if request_type.upper() == 'GET':
            response = session.get(url, params=query_params)
        elif request_type.upper() == 'POST':
            response = session.post(url, json=body, params=query_params)
        elif request_type.upper() == 'PUT':
            response = session.put(url, json=body, params=query_params)
        elif request_type.upper() == 'DELETE':
            response = session.delete(url, params=query_params)
        else:
            raise ValueError("Invalid request type. Use GET, POST, PUT, or DELETE.")

        # Raise an exception for HTTP errors (4xx and 5xx)
        response.raise_for_status()

        return response

    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

# Example usage:
# if __name__ == "__main__":
#     request_type = "GET"
#     url = "https://example.com/api"
#     body = {"key": "value"}
#     params = {"param_key": "param_value"}
#     query_params = {"query_key": "query_value"}
#     headers = {"Authorization": "Bearer YOUR_ACCESS_TOKEN"}

#     response = make_api_request(request_type, url, body, params, query_params, headers)

#     if response:
#         print(f"Response status code: {response.status_code}")
#         print(f"Response content: {response.text}")
