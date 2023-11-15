from dotenv import load_dotenv

load_dotenv()
from celery import Celery
from shared.models.opencopilot_db import create_database_schema
from shared.utils.opencopilot_utils import ENV_CONFIGS

create_database_schema()
app = Celery(
    'opencopilot_celery',
    broker=ENV_CONFIGS.CELERY_BROKER,
    backend=ENV_CONFIGS.CELERY_BACKEND
)

app.conf.imports = ('tasks',)