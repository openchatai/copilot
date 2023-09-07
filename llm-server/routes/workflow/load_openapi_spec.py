import yaml
import json
import requests
import os


def load_openapi_spec(spec_source):
    if isinstance(spec_source, str):
        if spec_source.startswith(("http://", "https://")):
            return load_spec_from_url(spec_source)
        else:
            return load_spec_from_file(spec_source)
    elif isinstance(spec_source, dict):
        return spec_source
    else:
        raise ValueError(
            "Unsupported spec_source type. It should be a URL, file path, or dictionary."
        )


def load_spec_from_url(url):
    response = requests.get(url)
    if response.status_code == 200:
        content_type = response.headers.get("content-type", "").lower()
        if "json" in content_type:
            return json.loads(response.text)
        elif "yaml" in content_type:
            return yaml.load(response.text, Loader=yaml.FullLoader)
        elif "text/plain" in content_type:
            return yaml.load(response.text, Loader=yaml.FullLoader)
        else:
            raise Exception(f"Unsupported content type in response: {content_type}")
    else:
        raise Exception(f"Failed to fetch OpenAPI spec from URL: {url}")


def load_spec_from_file(file_path):
    file_extension = os.path.splitext(file_path)[1].lower()
    if file_extension == ".json":
        with open(file_path, "r") as file:
            return json.load(file)
    elif file_extension in (".yaml", ".yml"):
        with open(file_path, "r") as file:
            return yaml.load(file, Loader=yaml.FullLoader)
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")
