from celery import shared_task

@shared_task
def pdf_reader(pdf_path):
    # Implement your PDF reading logic here
    return f"Read PDF: {pdf_path}"