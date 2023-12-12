import os
from typing import Iterable

from celery import shared_task
from qdrant_client import QdrantClient

from models.repository.copilot_repo import get_total_chatbots, get_chatbots_batch
from shared.models.opencopilot_db.chatbot import Chatbot
from utils.db import Database
from utils.get_logger import CustomLogger

client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

logger = CustomLogger(module_name=__name__)

db_instance = Database()
mongo = db_instance.get_db()
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")


@shared_task
def convert_swagger(batch_size: int = 100):
    # loop on cahtbots
    # load swagger files using SwaggerParser
    # we will extract actions from this swagger file via get_all_actions_method
    # we will insert them into qdrant
    # that is it
    pass

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
