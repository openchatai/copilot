import json, requests, yaml, os
from typing import Dict, Any, cast

shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")

import json
import yaml
from yaml.parser import ParserError


def fetch_swagger_text(swagger_url: str) -> str:
    if swagger_url.startswith("https://"):
        response = requests.get(swagger_url)
        if response.status_code == 200:
            try:
                # Try parsing the content as JSON
                json_content = json.loads(response.text)
                return json.dumps(json_content, separators=(",", ":"))
            except json.JSONDecodeError:
                try:
                    # Try parsing the content as YAML
                    yaml_content = yaml.safe_load(response.text)
                    if isinstance(yaml_content, dict):
                        return json.dumps(yaml_content, separators=(",", ":"))
                    else:
                        raise Exception("Invalid YAML content")
                except ParserError:
                    raise Exception("Failed to parse content as JSON or YAML")

        raise Exception("Failed to fetch Swagger content")

    try:
        with open(shared_folder + swagger_url, "r") as file:
            content = file.read()
            try:
                # Try parsing the content as JSON
                json_content = json.loads(content)
                return json.dumps(json_content, separators=(",", ":"))
            except json.JSONDecodeError:
                try:
                    # Try parsing the content as YAML
                    yaml_content = yaml.safe_load(content)
                    if isinstance(yaml_content, dict):
                        return json.dumps(yaml_content, separators=(",", ":"))
                    else:
                        raise Exception("Invalid YAML content")
                except ParserError:
                    raise Exception("Failed to parse content as JSON or YAML")
    except FileNotFoundError:
        raise Exception("File not found")
