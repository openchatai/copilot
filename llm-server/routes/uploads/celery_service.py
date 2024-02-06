import os
from utils.llm_consts import SHARED_FOLDER
from celery import Celery

os.makedirs(SHARED_FOLDER, exist_ok=True)
celery = Celery(
    "opencopilot_celery",
    broker=os.getenv("CELERY_BROKER", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_BACKEND", "redis://redis:6379/1"),
)
