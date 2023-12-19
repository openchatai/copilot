from routes.uploads.celery_service import celery
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)


def migrate_actions():
    logger.info("Starting celery job for reindexing qdrant store, embedding again...")
    celery.send_task("workers.tasks.convert_swagger_to_actions.index_actions", args=[])
