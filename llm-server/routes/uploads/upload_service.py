import os
from celery import Celery

celery = Celery('opencopilot_celery', broker='redis://localhost:6379/0')
def process_file(urls: list[str], namespace: str, bot_id):
    for url in urls:
        file_extension = os.path.splitext(url)[-1].lower()

        if file_extension == '.pdf':
            # Send the PDF file processing task to the remote Celery worker
            celery.send_task('process_pdf', args=[url, namespace, bot_id])
        elif file_extension in ('.html', '.htm', '.xml', '.json'):
            # Send the web file processing task to the remote Celery worker
            celery.send_task('process_web', args=[url, namespace, bot_id])
        else:
            # Send the task for other file types to the remote Celery worker
            celery.send_task('process_other', args=[url, namespace, bot_id])