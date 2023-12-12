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

client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

logger = CustomLogger(module_name=__name__)

db_instance = Database()
mongo = db_instance.get_db()
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")


@shared_task
def index_action(batch_size: int = 100):
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

        with open(swagger_url) as f:
            f_content = f.read()

        swagger_parser = SwaggerParser(f_content)

        actions = swagger_parser.get_all_actions(bot_id=bot_id)

        for action in actions:
            action_vector_service.create_action(action)

    except Exception as e:
        print(f"An unexpected error occurred - {e}")
        # Handle other unexpected errors here


def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except ValueError:
        return False
