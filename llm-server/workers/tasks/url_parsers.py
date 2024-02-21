import io
import json
from typing import List, Optional, Tuple, Union
from PyPDF2 import PdfReader
from enum import Enum

from abc import ABC, abstractmethod
from bs4 import BeautifulSoup
from utils.get_logger import CustomLogger
import requests

logger = CustomLogger(__name__)


class LinkInformation:
    def __init__(self, href: str, link_text: str, target_text: str):
        self.href = href
        self.link_text = link_text
        self.target_text = target_text

    def __repr__(self):
        return f"LinkInformation(Href: {self.href}, Link Text: {self.link_text}, Target Text: {self.target_text})"


class ContentParser(ABC):
    @abstractmethod
    def parse(self, content) -> List[LinkInformation]:
        pass

    @abstractmethod
    def find_all_headings_and_highlights(
        self, content: requests.Response
    ) -> List[Tuple[str, Optional[str]]]:
        pass


class TextContentParser(ContentParser):
    def parse(self, content) -> List[LinkInformation]:
        soup = BeautifulSoup(content, "lxml")
        links = soup.find_all("a")

        results = []
        for link in links:
            href = link.get("href")
            if href and (href.startswith("#") or href.startswith("./#")):
                id_to_search = href[1:] if href.startswith("#") else href[3:]
                target = soup.find(id=id_to_search)
                if target:
                    results.append(
                        LinkInformation(href, link.text.strip(), target.text.strip())
                    )

        # if no on-page links detected, collect info for all links
        if not results:
            text_content = " ".join(
                [
                    p.text.strip()
                    for p in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6"])
                ]
            )

            results.append(LinkInformation("", "", text_content))
        return results

    def find_all_headings_and_highlights(self, response: requests.Response):
        """Finds all h-tags and their corresponding highlights from an HTML response.

        Args:
            response: A requests response object containing HTML content.

        Returns:
            A list of tuples, where each tuple contains:
                - heading (str): The text of an h-tag.
                - highlight (str): The text content of the element following the h-tag.
        """

        soup = BeautifulSoup(response.content, "html.parser")

        headings_and_highlights: List[Tuple[str, Optional[str]]] = []
        for heading in soup.find_all(["h1", "h2", "h3", "h4", "h5", "h6"]):
            highlight_element = heading.next_sibling
            highlight = (
                highlight_element.get_text(strip=True) if highlight_element else None
            )
            headings_and_highlights.append((heading.text, highlight))

        return headings_and_highlights


class JsonContentParser(ContentParser):
    def parse(self, content) -> Union[LinkInformation, None]:
        try:
            json_data = json.loads(content)
            # Convert JSON object to a string representation
            json_string = json.dumps(json_data, indent=2)
            return LinkInformation(href="", link_text="", target_text=json_string)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON content: {e}")
            return None

    def find_all_headings_and_highlights(self, content: str):
        raise NotImplementedError()


class PDFContentParser(ContentParser):
    def parse(self, content) -> Union[LinkInformation, None]:
        try:
            pdf_file = PdfReader(io.BytesIO(content))
            text = ""

            for page_num in range(len(pdf_file.pages)):
                page = pdf_file.pages[page_num]
                text += page.extract_text()

            return LinkInformation(href="", link_text="", target_text=text)
        except Exception as e:
            print(f"Failed to parse PDF content: {e}")
            return None

    def find_all_headings_and_highlights(self, content: str):
        raise NotImplementedError()


class ContentType(Enum):
    PDF = "pdf"
    HTML = "html"
    TEXT = "text"
    UNKNOWN = "unknown"


class ParserFactory:
    @staticmethod
    def get_parser(url) -> ContentParser:
        content_type = identify_content_type(url)
        if content_type == ContentType.HTML:
            return TextContentParser()
        elif content_type == ContentType.PDF:
            return PDFContentParser()
        elif content_type == ContentType.TEXT:
            return TextContentParser()
        elif content_type == ContentType.UNKNOWN:
            raise ValueError(f"No parser available for content type: {content_type}")
        # Add more parsers as needed for different content types
        raise ValueError(f"No parser available for content type: {content_type}")


def identify_content_type(url):
    try:
        response = requests.head(url)
        response.raise_for_status()  # Raise an exception for HTTP errors
    except requests.exceptions.RequestException as e:
        print(f"Error fetching the content: {e}")
        return

    # Check the Content-Type header
    content_type = response.headers.get("Content-Type", "")

    print(f"Content-Type: {content_type}")

    # Identify whether it's a PDF, HTML, or Text
    if "pdf" in content_type.lower():
        return ContentType.PDF
    elif "html" in content_type.lower():
        return ContentType.HTML
    elif "text" in content_type.lower():
        return ContentType.TEXT
    else:
        return ContentType.UNKNOWN
