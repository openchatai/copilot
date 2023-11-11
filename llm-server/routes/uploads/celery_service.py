import os
from celery import Celery
import logging

logger = logging.getLogger(__name__)

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/app/shared_data")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
celery = Celery(
    "opencopilot_celery",
    broker=os.getenv("CELERY_BROKER", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_BACKEND", "redis://localhost:6379/1"),
)
