import os
from typing import Iterable
from urllib.parse import urlparse

from celery import shared_task

from models.repository.action_repo import (
    create_action,
    find_action_by_method_id_and_bot_id,
)
from models.repository.copilot_repo import get_total_chatbots, get_chatbots_batch
from routes.action import action_vector_service
from shared.models.opencopilot_db.chatbot import Chatbot
from utils.get_logger import CustomLogger
from utils.llm_consts import initialize_qdrant_client
from utils.swagger_parser import SwaggerParser
from utils.llm_consts import SHARED_FOLDER
import requests

# Initialize Qdrant Client and other global variables
client = initialize_qdrant_client()
logger = CustomLogger(module_name=__name__)


@shared_task
def index_actions(batch_size: int = 100):
    """
    Index chatbot data in batches.

    :param batch_size: Size of each batch for processing chatbots.
    """
    total_files: int = get_total_chatbots()
    logger.info(
        f"Starting indexing process for {total_files} chatbots in batches of {batch_size}"
    )
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
        if str(chatbot.swagger_url) == "remove.this.filed.after.migration":
            logger.info(f"No swagger file found for bot {chatbot.id}, skipping ...")
            continue
        process_swagger_file(chatbot)


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


def process_swagger_file(chatbot: Chatbot):
    """
    Process the Swagger file of a chatbot, logs metadata such as the number of actions.
    Prevents duplicating actions if they already exist.

    :param chatbot: A Chatbot object.
    """
    bot_id = str(chatbot.id)
    swagger_url = str(chatbot.swagger_url)

    try:
        if is_valid_url(swagger_url):
            # If the provided URL is valid, fetch the content using requests
            response = requests.get(swagger_url)
            f_content = response.text
        else:
            # If it's not a URL, assume it's a local file path
            swagger_url = os.path.join(SHARED_FOLDER, swagger_url)
            with open(swagger_url) as f:
                f_content = f.read()

        swagger_parser = SwaggerParser(f_content)
        swagger_parser.ingest_swagger_summary(bot_id)
        actions = swagger_parser.get_all_actions(bot_id=bot_id)
        num_actions = len(actions)

        for action in actions:
            if not action.operation_id:
                continue
            if not action_exists_in_rds(bot_id, action.operation_id):
                create_action(chatbot_id=bot_id, data=action)
                action_vector_service.create_action(action)
        logger.info(
            f"Successfully processed Swagger file for bot {bot_id} with {num_actions} actions"
        )

    except Exception as e:
        logger.error(
            "swagger_parsing_failed",
            bot_id=bot_id,
            swagger_url=swagger_url,
            error=e
        )


def action_exists_in_rds(bot_id: str, operation_id: str) -> bool:
    """
    Check if an action already exists in the database.

    :param bot_id: The ID of the chatbot.
    :param operation_id: The operation id
    :return: True if the action exists, False otherwise.

    Args:
        operation_id:
        bot_id:
    """
    # Implement the logic to check if the action exists in the database
    # This could involve querying the database with the bot_id and some unique identifier from the action_data
    return find_action_by_method_id_and_bot_id(
        bot_id=bot_id, operation_id=operation_id
    )  # Placeholder return
