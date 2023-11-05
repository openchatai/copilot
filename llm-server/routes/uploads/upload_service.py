import os
from celery import Celery
import urllib.parse

import logging, traceback

logger = logging.getLogger(__name__)

celery = Celery(
    "opencopilot_celery",
    broker=os.getenv("CELERY_BROKER", "redis://localhost:6379/0"),
    backend=os.getenv("CELERY_BACKEND", "redis://localhost:6379/1"),
)


def process_file(urls: list[str], namespace: str):
    for url in urls:
        try:
            # Extract the path portion of the URL
            parsed = urllib.parse.urlparse(url)
            path = parsed.path

            # Get the filename extension
            filename = os.path.basename(path)
            ext = os.path.splitext(filename)[1]

            if ext == ".pdf":
                # Send the PDF file processing task to the remote Celery worker
                celery.send_task(
                    "tasks.process_pdfs.process_pdf", args=[url, namespace]
                )
            elif ext in (".html", ".htm", ".xml", ".json"):
                # Send the web file processing task to the remote Celery worker
                celery.send_task("process_web", args=[url, namespace])
            else:
                # Send the task for other file types to the remote Celery worker
                celery.send_task("process_other", args=[url, namespace])

        except Exception as e:
            traceback_str = traceback.format_exc()
            logger.error("Error processing %s: %s\n%s", url, e, traceback_str)
