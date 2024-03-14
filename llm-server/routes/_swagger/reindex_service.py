from routes.uploads.celery_service import celery


def migrate_actions():
    celery.send_task("workers.tasks.convert_swagger_to_actions.index_actions", args=[])
