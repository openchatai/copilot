import requests
from scrapingbee import ScrapingBeeClient
from utils.llm_consts import SCRAPINGBEE_API_KEY

from abc import ABC, abstractmethod
from functools import lru_cache


class WebScraperStrategy(ABC):
    @abstractmethod
    def extract_data(self, url) -> str:
        return ""


class RequestsWebScraperStrategy(WebScraperStrategy):
    def extract_data(self, url):
        """Extract data from a website using requests"""
        response = requests.get(url)
        if not response.ok:
            raise Exception("Failed to load URL.")
        return response.text


class ScrapingBeeWebScraperStrategy(WebScraperStrategy):
    def __init__(self):
        self._apikey = SCRAPINGBEE_API_KEY

    def extract_data(self, url):
        """Extract data from a website using ScrapingBee API"""
        client = ScrapingBeeClient()
        response = client.get(
            url,
            {
                "block_ads": False,
                "block_resources": True,
                "device": "desktop",
                "render_js": True,
            },
        )
        return response.text


@lru_cache(maxsize=1)
def get_scraper(strategy: str) -> WebScraperStrategy:
    scraper_cls = None
    if strategy == "scrapingbee" and SCRAPINGBEE_API_KEY is not None:
        scraper_cls = ScrapingBeeWebScraperStrategy
    if not scraper_cls:
        scraper_cls = RequestsWebScraperStrategy

    scraper = scraper_cls()  # type: ignore
    return scraper
