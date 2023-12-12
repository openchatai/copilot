import os
from typing import Iterable
from urllib.parse import urlparse

from celery import shared_task
from qdrant_client import QdrantClient

from models.repository.copilot_repo import get_total_chatbots, get_chatbots_batch
from routes.action import action_vector_service
from shared.models.opencopilot_db.chatbot import Chatbot
from utils.db import Database
from utils.get_logger import CustomLogger
from utils.swagger_parser import SwaggerParser

# Initialize Qdrant Client and other global variables
qdrant_client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))
logger = CustomLogger(module_name=__name__)
db_instance = Database()
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")


@shared_task
def index_action(batch_size: int = 100):
    """
    Index chatbot data in batches.

    :param batch_size: Size of each batch for processing chatbots.
    """
    total_files: int = get_total_chatbots()
    logger.info(f"Starting indexing process for {total_files} chatbots in batches of {batch_size}")
    for offset in range(0, total_files, batch_size):
        batch: Iterable[Chatbot] = get_chatbots_batch(offset, batch_size)
        process_swagger_files_batch(batch)
        logger.info(f"Processed a batch of chatbots from offset {offset}")


def process_swagger_files_batch(chatbots: Iterable[Chatbot]):
    """
    Process a batch of chatbots.

    :param chatbots: An iterable of Chatbot objects.
    """
    for chatbot in chatbots:
        process_swagger_file(chatbot)


def process_swagger_file(chatbot: Chatbot):
    """
    Process the Swagger file of a chatbot, logs metadata such as number of actions.

    :param chatbot: A Chatbot object.
    """
    bot_id = str(chatbot.id)
    try:
        swagger_url = str(chatbot.swagger_url)
        if not is_valid_url(swagger_url):
            swagger_url = os.path.join(shared_folder, swagger_url)

        with open(swagger_url) as f:
            f_content = f.read()

        swagger_parser = SwaggerParser(f_content)
        actions = swagger_parser.get_all_actions(bot_id=bot_id)
        num_actions = len(actions)

        for action in actions:
            action_vector_service.create_action(action)
        logger.info(f"Successfully processed Swagger file for bot {bot_id} with {num_actions} actions")

    except Exception as e:
        logger.error(f"Error processing Swagger file for bot {bot_id}: {e}")


def is_valid_url(url: str) -> bool:
    """
    Validate if the given string is a properly formatted URL.

    :param url: The URL string to validate.
    :return: True if the URL is valid, False otherwise.
    """
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
