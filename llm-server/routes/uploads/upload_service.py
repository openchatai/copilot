import os
from celery import Celery

celery = Celery('opencopilot_celery', broker='redis://localhost:6379/0')
def process_file(namespace: str, filename: str, bot_id: str):
    # Determine the file type based on the filename extension
    file_extension = os.path.splitext(filename)[-1].lower()

    if file_extension == '.pdf':
        # Send the PDF file processing task to the remote Celery worker
        celery.send_task('process_pdfs', args=[namespace, list[filename], bot_id])
    elif file_extension in ('.html', '.htm', '.xml', '.json'):
        # Send the web file processing task to the remote Celery worker
        celery.send_task('process_web', args=[namespace, filename], queue='web_queue')
    else:
        # Send the task for other file types to the remote Celery worker
        celery.send_task('process_other', args=[namespace, filename], queue='other_queue')