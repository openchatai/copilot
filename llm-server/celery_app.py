import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
import sentry_sdk
from celery import Celery
from shared.models.opencopilot_db import create_database_schema
from sentry_sdk.integrations.celery import CeleryIntegration

sentry_sdk.init(
    traces_sample_rate=1.0, profiles_sample_rate=1.0, integrations=[CeleryIntegration()]
)


create_database_schema()
app = Celery(
    "opencopilot_celery",
    broker=os.getenv("CELERY_BROKER", "redis://redis:6379/0"),
    backend=os.getenv("CELERY_BACKEND", "redis://redis:6379/1"),
)
app.conf.imports = ("workers.tasks",)

app.conf.broker_connection_max_retries = 5
app.conf.broker_connection_retry = True
app.conf.broker_connection_retry_on_startup = True
