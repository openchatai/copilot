import os
from urllib.parse import urlparse
from jsonschema import RefResolutionError, ValidationError
from qdrant_client import QdrantClient
from routes._swagger.service import save_swagger_paths_to_qdrant
from utils.db import Database
from typing import Iterable, Any
from prance import ResolvingParser

client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

db_instance = Database()
mongo = db_instance.get_db()


def reindex_apis(batch_size: int = 100):
    total_files: int = mongo.swagger_files.count_documents({})

    for offset in range(0, total_files, batch_size):
        batch: Iterable[Any] = mongo.swagger_files.find().skip(offset).limit(batch_size)
        process_swagger_files_batch(batch)


def process_swagger_files_batch(swagger_files: Iterable[Any]):
    for swagger_file in swagger_files:
        process_swagger_file(swagger_file)


def process_swagger_file(swagger_file: Any):
    try:
        bot_id: str = swagger_file["meta"]["bot_id"]
        swagger_url = swagger_file["meta"]["swagger_url"]

        # Check if swagger_url is a valid URL
        if not is_valid_url(swagger_url):
            swagger_url = "/app/shared_data/url"

        swagger_doc = ResolvingParser(url=swagger_url)

        save_swagger_paths_to_qdrant(swagger_doc=swagger_doc, bot_id=bot_id)

    except KeyError as e:
        print(f"Error: Missing key in swagger_file - {e}")
        # Handle the missing key error here

    except RefResolutionError as e:
        print(f"Error resolving JSON references - {e}")
        # Handle reference resolution error here

    except ValidationError as e:
        print(f"Error in JSON schema validation - {e}")
        # Handle JSON schema validation error here

    except Exception as e:
        print(f"An unexpected error occurred - {e}")
        # Handle other unexpected errors here


def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
