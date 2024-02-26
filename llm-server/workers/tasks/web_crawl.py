from typing import Set
from urllib.parse import urlparse, urljoin
from celery import shared_task

import traceback
import uuid
from langchain.text_splitter import RecursiveCharacterTextSplitter
from routes.search.search_service import add_cmdbar_data, Item
from shared.utils.opencopilot_utils.init_vector_store import init_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from shared.models.opencopilot_db.website_data_sources import (
    count_crawled_pages,
    create_website_data_source,
    get_website_data_source_by_id,
)
from utils.llm_consts import WEB_CRAWL_STRATEGY, max_pages_to_crawl
from models.repository.copilot_settings import ChatbotSettingCRUD
from workers.tasks.url_parsers import ParserFactory, TextContentParser

from workers.utils.remove_escape_sequences import remove_escape_sequences
from utils.get_logger import CustomLogger
from workers.tasks.web_scraping_strategy import get_scraper
from bs4 import BeautifulSoup
from routes.search.meilisearch_service import add_item_to_index

logger = CustomLogger(__name__)


def get_links(url: str, strategy=WEB_CRAWL_STRATEGY) -> Set[str]:
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


def scrape_url(url: str, token: str):
    try:
        strategy = WEB_CRAWL_STRATEGY
        # for external sources always use text content parser, because we don't know the content type
        if strategy != "requests":
            parser = TextContentParser()
        else:
            parser = ParserFactory.get_parser(url)

        scraper = get_scraper(strategy)
        content = scraper.extract_data(url)

        title, headings = parser.find_all_headings_and_highlights(content)
        items = [
            Item(
                id=uuid.uuid4().hex,
                title=title,
                heading_text=heading_text,
                heading_id=heading_id,
                token=token,
                url=url,
            )
            for heading_text, heading_id in headings
        ]

        if len(items) > 0:
            # add_cmdbar_data(items, {"url": url, "bot_id": bot_id})
            add_item_to_index(items)
        return parser.parse_text_content(content)
    except ValueError as e:
        # Log an error message if no parser is available for the content type
        logger.error("SCRAPE_URL_FN", error=e)
        return None


def scrape_website(url: str, bot_id: str, max_pages: int, token: str) -> int:
    """Scrapes a website in breadth-first order, following all of the linked pages.

    Args:
      url: The URL of the website to scrape.
      max_pages: The maximum number of pages to scrape.

    Returns:
      The total number of scraped pages.
    """
    total_pages_scraped = count_crawled_pages(bot_id)
    if total_pages_scraped > max_pages:
        logger.warn(
            "web_crawl_max_pages_reached",
            info=f"Reached max pages to crawl for chatbot {bot_id}. Stopping crawl.",
        )

    visited_urls: Set[str] = set()

    # Use a queue for breadth-first scraping
    queue = [url]

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

            content = scrape_url(current_url, token=token)

            total_pages_scraped += 1
            visited_urls.add(current_url)

            if content is not None:
                # Process the scraped content as needed
                target_text = remove_escape_sequences(content)
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000, chunk_overlap=200, length_function=len
                )
                docs = text_splitter.create_documents([target_text])
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

            links = get_links(current_url)
            queue.extend(links)

        except Exception as e:
            logger.error("WEB_SCRAPE_ERROR", error=e)

        # Mark the URL as visited
        visited_urls.add(current_url)

    return total_pages_scraped


@shared_task(enable_trace=True)
def web_crawl(url, bot_id: str, token: str):
    try:
        # setting = ChatbotSettings.get_chatbot_setting(bot_id)
        setting = ChatbotSettingCRUD.get_chatbot_setting(bot_id)

        if setting is None:
            setting = ChatbotSettingCRUD.create_chatbot_setting(
                max_pages_to_crawl=max_pages_to_crawl, chatbot_id=bot_id
            )

        logger.info(f"chatbot_settings: {setting.max_pages_to_crawl}")
        create_website_data_source(chatbot_id=bot_id, status="PENDING", url=url)

        scrape_website(
            url, bot_id, setting.max_pages_to_crawl or max_pages_to_crawl, token
        )
    except Exception as e:
        logger.error(
            "WEB_SCRAPING_FAILED", info=f"Failed to scrape website {url}.", error=e
        )
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

    scrape_website(url, website_data_source.bot_id, max_pages_to_crawl)
