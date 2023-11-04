from celery import shared_task

@shared_task
def web_crawl(url):
    # Implement your web crawling logic here
    return f"Crawled {url}"