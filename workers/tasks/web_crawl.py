from celery import shared_task
from selenium import webdriver
from bs4 import BeautifulSoup

import os, re, logging
from selenium.webdriver.firefox.options import Options
from langchain.text_splitter import RecursiveCharacterTextSplitter

from shared.utils.opencopilot_utils import get_embeddings, init_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions

selenium_grid_url = os.getenv("SELENIUM_GRID_URL", "http://localhost:4444/wd/hub")

def is_valid_url(url, target_url):
    """Returns True if the URL is valid and the root of both URLs are the same, False otherwise."""

    # Regular expression for matching valid URLs.
    regex = re.compile(r'^(?:http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&:/~+#-])$')

    # Check if the URL is valid.
    if regex.match(url) is None:
        return False

    # Get the root of the URL.
    url_root = regex.match(url).group(1)
    target_url_root = regex.match(target_url).group(1)

    # Check if the root of both URLs are the same.
    return url_root == target_url_root

def scrape_website_in_depth(url, bot_id: str, depth=1, driver=None):
    """Scrapes a website in depth, recursively following all of the linked pages.

    Args:
      url: The URL of the website to scrape.
      depth: The maximum depth to scrape.
      driver: An optional WebDriver object. If this argument is omitted, a new WebDriver object will be created.

    Returns:
      A list of all of the scraped pages.
    """

    # Navigate to the URL to scrape.
    driver.get(url)

    # Get the text of the current page.
    page_source = driver.page_source

    # Parse the HTML of the current page.
    soup = BeautifulSoup(page_source, "lxml")

    # Extract all of the unique URLs from the current page.
    unique_urls = []
    for link in soup.find_all("a"):
        if "href" in link.attrs and link["href"] not in unique_urls and is_valid_url(link["href"], url):
            unique_urls.append(link["href"])

    # If the depth has not been reached, recursively scrape all of the linked pages.
    if depth > 1:
        for unique_url in unique_urls:
            driver.refresh()
            scrape_website_in_depth(unique_url, depth - 1, driver)

    text = soup.get_text()
    
    # push to vector db
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, chunk_overlap=200, length_function=len
    )
    
    docs = text_splitter.create_documents([text])
    embeddings = get_embeddings()
    init_vector_store(docs, embeddings, StoreOptions(namespace=bot_id))


@shared_task
def web_crawl(url, bot_id: str):
    try:
        print(f"Received: {url}, {bot_id}")
        options = Options()
        driver = webdriver.Remote(command_executor=selenium_grid_url, options=options)
        driver.set_script_timeout(300)
        driver.set_page_load_timeout(300)
        scrape_website_in_depth(url, bot_id, 15, driver)
    except Exception as e:
        logging.error(f"Failed to crawl website: {e}")
    finally:
        driver.quit()
