import os
import re
from celery import shared_task
from selenium import webdriver
from bs4 import BeautifulSoup
import traceback

from selenium.webdriver.firefox.options import Options
from selenium.webdriver.remote.webdriver import BaseWebDriver
from langchain.text_splitter import RecursiveCharacterTextSplitter

from shared.utils.opencopilot_utils.init_vector_store import init_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from shared.models.opencopilot_db.website_data_sources import (
    create_website_data_source,
    get_website_data_source_by_id,
    update_website_data_source_status_by_url,
)
from typing import Set
from collections import deque

from workers.utils.remove_escape_sequences import remove_escape_sequences
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)

selenium_grid_url = os.getenv("SELENIUM_GRID_URL", "http://selenium:4444/wd/hub")


def is_valid_url(url, target_url):
    """Returns True if the URL is valid and the root of both URLs are the same, False otherwise."""

    # Regular expression for matching valid URLs.
    regex = re.compile(
        r"^(?:http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&:/~+#-])$"
    )

    # Check if the URL is valid.
    if regex.match(url) is None:
        return False

    # Get the root of the URL.
    url_root = regex.match(url).group(1)
    target_url_root = regex.match(target_url).group(1)

    # Check if the root of both URLs are the same.
    return url_root == target_url_root


def scrape_website_in_bfs(
    url: str, bot_id: str, unique_urls: Set[str], max_pages: int
) -> int:
    """Scrapes a website in breadth-first order, following all of the linked pages.

    Args:
      url: The URL of the website to scrape.
      max_pages: The maximum number of pages to scrape.

    Returns:
      The total number of scraped pages.
    """

    driver: BaseWebDriver = None
    total_pages_scraped = 0
    visited_urls = set()
    queue = deque([url])

    try:
        while queue:
            url = queue.popleft()
            if url in visited_urls or total_pages_scraped >= max_pages:
                continue

            create_website_data_source(chatbot_id=bot_id, status="PENDING", url=url)
            visited_urls.add(url)
            unique_urls.add(url)
            total_pages_scraped += 1

            if driver is None:
                driver = get_web_driver()

            driver.get(url)
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, features="lxml")

            for link in soup.find_all("a"):
                if "href" in link.attrs:
                    next_url = link["href"]
                    if next_url.startswith("http") and next_url not in visited_urls:
                        queue.append(next_url)

            text = soup.get_text()
            text = re.sub(
                r"\s+", " ", text
            )  # Replace all whitespace with single spaces
            text = text.strip()  # Trim leading and trailing whitespace

            text = remove_escape_sequences(text)

            # push to vector db
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=1000, chunk_overlap=200, length_function=len
            )

            docs = text_splitter.create_documents([text])
            init_vector_store(
                docs,
                StoreOptions(namespace="knowledgebase", metadata={"bot_id": bot_id}),
            )
            update_website_data_source_status_by_url(url=url, status="SUCCESS")

        if driver is not None:
            driver.quit()

    except Exception as e:
        logger.error("Failed to crawl", error=str(e))
        if driver is not None:
            driver.quit()
        update_website_data_source_status_by_url(url=url, status="FAILED", error=str(e))

    return total_pages_scraped


def get_web_driver():
    options = Options()
    driver = webdriver.Remote(command_executor=selenium_grid_url, options=options)
    driver.set_script_timeout(300)
    driver.set_page_load_timeout(300)
    return driver


@shared_task
def web_crawl(url, bot_id: str):
    try:
        print(f"Received: {url}, {bot_id}")
        create_website_data_source(chatbot_id=bot_id, status="PENDING", url=url)
        unique_urls: set = set()
        scrape_website_in_bfs(url, bot_id, unique_urls, 5)
    except Exception as e:
        traceback.print_exc()


@shared_task
def resume_failed_website_scrape(website_data_source_id: str):
    """Resumes a failed website scrape.

    Args:
      website_data_source_id: The ID of the website data source to resume scraping.
    """

    # Get the website data source.
    website_data_source = get_website_data_source_by_id(website_data_source_id)
    
    # Get the URL of the website to scrape.
    url = website_data_source.url

    # Scrape the website.
    unique_urls: set = set()
    scrape_website_in_bfs(url, website_data_source.bot_id, unique_urls, 5)
