from typing import Iterable, Any
from routes.uploads.celery_service import celery
from utils.get_logger import CustomLogger


logger = CustomLogger(module_name=__name__)


def reindex_apis():
    logger.info("Starting celery job for reindexing qdrant store, embedding again...")
    celery.send_task("workers.tasks.reindex_swagger.reindex_apis", args=[])


