import os
from celery import Celery
import logging

from opencopilot_utils import ENV_CONFIGS

logger = logging.getLogger(__name__)

SHARED_FOLDER = ENV_CONFIGS.SHARED_FOLDER
os.makedirs(SHARED_FOLDER, exist_ok=True)
celery = Celery(
    "opencopilot_celery",
    broker=ENV_CONFIGS.CELERY_BROKER,
    backend=ENV_CONFIGS.CELERY_BACKEND,
)
