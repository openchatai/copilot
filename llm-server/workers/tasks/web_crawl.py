from typing import Set
from urllib.parse import urljoin
from celery import shared_task

import logging
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from routes.search.search_service import Item
from shared.utils.opencopilot_utils.init_vector_store import init_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from shared.models.opencopilot_db.website_data_sources import (
    count_crawled_pages,
    create_website_data_source,
    upsert_website_status,
)
from utils.llm_consts import WEB_CRAWL_STRATEGY, max_pages_to_crawl
from models.repository.copilot_settings import ChatbotSettingCRUD
from workers.tasks.url_parsers import ParserFactory, TextContentParser

from workers.utils.remove_escape_sequences import remove_escape_sequences
from workers.tasks.web_scraping_strategy import get_scraper
from bs4 import BeautifulSoup

# from routes.search.meilisearch_service import add_item_to_index
from utils.get_logger import SilentException
from models.repository.copilot_repo import find_one_or_fail_by_id


def get_links(url: str, strategy: str) -> Set[str]:
    if url.endswith((".jpg", ".jpeg", ".png", ".gif", ".bmp", ".mp4", ".avi", ".mkv")):
        return set()

    scraper = get_scraper(strategy)
    html = scraper.extract_data(url)

    if html:
        soup = BeautifulSoup(html, "lxml")
        # base_url = urlparse(url).scheme + "://" + urlparse(url).hostname
        links = [a.get("href") for a in soup.find_all("a", href=True)]

        # Only apply urljoin if the link isn't already an http or https
        absolute_links = [
            urljoin(url, link) if not link.startswith("http") else link
            for link in links
        ]

        same_host_links: Set[str] = set()

        for abslink in absolute_links:
            if abslink.startswith(url):
                same_host_links.add(abslink.split("#")[0])

        return same_host_links
    else:
        print("Failed to retrieve content.")
        return set()


def scrape_url(url: str, token: str, web_crawl_strategy: str):
    try:
        # for external sources always use text content parser, because we don't know the content type
        if web_crawl_strategy != "requests":
            parser = TextContentParser()
        else:
            parser = ParserFactory.get_parser(url)

        logging.info(f"Scraping URL: {url}")
        scraper = get_scraper(web_crawl_strategy)
        content = scraper.extract_data(url)

        content = parser.parse_text_content(content)
        return content
    except ValueError as e:
        # Log an error message if no parser is available for the content type

        return None


def scrape_website(
    url: str, bot_id: str, max_pages: int, token: str, web_crawl_strategy: str
) -> int:
    total_pages_scraped = count_crawled_pages(bot_id)
    if total_pages_scraped > max_pages:
        logging.info(f"Exceeded the maximum number of pages to scrape: {max_pages}.")
        SilentException.capture_exception(
            ValueError(f"Exceeded the maximum number of pages to scrape: {max_pages}.")
        )

    visited_urls: Set[str] = set()

    # Use a queue for breadth-first scraping
    queue = [url]
    current_url = url
    while queue and total_pages_scraped < max_pages:
        current_url = queue.pop(0)

        # Skip if the URL has been visited
        if current_url in visited_urls:
            continue

        try:
            # Scrape the content of the current URL
            if current_url.endswith(
                (".jpg", ".jpeg", ".png", ".gif", ".bmp", ".mp4", ".avi", ".mkv")
            ):
                continue

            content = scrape_url(
                current_url, token=token, web_crawl_strategy=web_crawl_strategy
            )

            total_pages_scraped += 1
            visited_urls.add(current_url)

            if content is not None:
                # Process the scraped content as needed
                target_text = remove_escape_sequences(content)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000, chunk_overlap=200, length_function=len
                )
                docs = text_splitter.create_documents([target_text])
                logging.debug(f"Scraped content: {docs}")
                init_vector_store(
                    docs,
                    StoreOptions(
                        namespace="knowledgebase",
                        metadata={"bot_id": bot_id, "link": current_url},
                    ),
                )
                create_website_data_source(
                    chatbot_id=bot_id, url=current_url, status="SUCCESS"
                )

            links = get_links(current_url, web_crawl_strategy)
            queue.extend(links)

        except Exception as e:
            upsert_website_status(bot_id, current_url, "FAILED")
            import traceback

            traceback.print_exc()
            SilentException.capture_exception(
                e, url=current_url, bot_id=bot_id, token=token
            )

        # Mark the URL as visited
        visited_urls.add(current_url)

    return total_pages_scraped


@shared_task(enable_trace=True)
def web_crawl(url, bot_id: str, token: str):
    try:
        web_crawl_strategy = WEB_CRAWL_STRATEGY
        setting = ChatbotSettingCRUD.get_chatbot_setting(bot_id)
        if setting is None:
            setting = ChatbotSettingCRUD.create_chatbot_setting(
                max_pages_to_crawl=max_pages_to_crawl, chatbot_id=bot_id
            )

        create_website_data_source(chatbot_id=bot_id, status="PENDING", url=url)

        scrape_website(
            url, bot_id, setting.max_pages_to_crawl, token, web_crawl_strategy
        )
    except Exception as e:
        SilentException.capture_exception(e, url=url, bot_id=bot_id, token=token)
