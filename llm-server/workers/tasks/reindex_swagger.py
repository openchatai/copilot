import time

from urllib.parse import urlparse
from celery import shared_task
from jsonschema import RefResolutionError, ValidationError
from prance import ResolvingParser
import os
from qdrant_client import QdrantClient, models
from routes._swagger.service import save_swagger_paths_to_qdrant
from typing import Iterable
from utils.db import Database
from utils.get_logger import CustomLogger
from shared.models.opencopilot_db.chatbot import Chatbot
from models.repository.copilot_repo import get_total_chatbots, get_chatbots_batch

logger = CustomLogger(module_name=__name__)

db_instance = Database()
mongo = db_instance.get_db()
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")


@shared_task
def reindex_apis(batch_size: int = 100):
    total_files: int = get_total_chatbots()
    for offset in range(0, total_files, batch_size):
        batch: Iterable[Chatbot] = get_chatbots_batch(offset, batch_size)
        process_swagger_files_batch(batch)


def process_swagger_files_batch(chatbots: Iterable[Chatbot]):
    for chatbot in chatbots:
        process_swagger_file(chatbot)


def process_swagger_file(chatbot: Chatbot):
    bot_id = str(chatbot.id)
    try:
        swagger_url = str(chatbot.swagger_url)

        # Check if swagger_url is a valid URL
        if not is_valid_url(swagger_url):
            swagger_url = f"{shared_folder}{swagger_url}"

        swagger_doc = ResolvingParser(url=swagger_url)

        count_result = client.count(
            collection_name="apis",
            scroll_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.bot_id",
                        match=models.MatchValue(value=str(chatbot.id)),
                    )
                ],
            ),
            exact=True,
        )

        if count_result.count == 0:
            logger.info("total count = 0", count_result=count_result)
            save_swagger_paths_to_qdrant(swagger_doc=swagger_doc, bot_id=bot_id)
            time.sleep(3)
        else:
            logger.info(
                "Found existing points, no action required", count_result=count_result
            )

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
