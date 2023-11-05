from celery import Celery
from database_setup import create_database_schema
from dotenv import load_dotenv

load_dotenv()

create_database_schema()
app = Celery(
    'my_celery_project',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)

