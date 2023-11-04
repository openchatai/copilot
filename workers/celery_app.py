from celery import Celery

app = Celery(
    'my_celery_project',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/1'
)