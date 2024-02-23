import io
import json
from typing import List, Optional, Tuple, Union
from PyPDF2 import PdfReader
from enum import Enum

from abc import ABC, abstractmethod
from bs4 import BeautifulSoup, Tag
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
    def get_url_fragments(self, content) -> List[LinkInformation]:
        pass

    @abstractmethod
    def parse_text_content(self, content) -> str:
        pass

    @abstractmethod
    def find_all_headings_and_highlights(
        self, content: str
    ) -> Tuple[str, List[Tuple[str, str]]]:
        pass


class TextContentParser(ContentParser):
    def get_url_fragments(self, content) -> List[LinkInformation]:
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

    # for now i am returning only the headings and the page title. We will enhance this later to also have highlights
    def find_all_headings_and_highlights(
        self, content: str
    ) -> Tuple[str, List[Tuple[str, str]]]:

        soup = BeautifulSoup(content, "lxml")
        title = soup.title.text if soup.title else ""
        elements_with_id = soup.find_all(id=True)
        links = soup.find_all("a")
        pairs = []
        for element in elements_with_id:
            id_ = element.get("id")
            if id_:  # A simple check if the id exists
                corresponding_links = [
                    link for link in links if link.get("href") == "#" + id_
                ]  # Removed "./#" prefix
                if corresponding_links:
                    for link in corresponding_links:
                        pairs.append((element.get_text(strip=True), id_))
        return title, pairs

    def parse_text_content(self, content) -> str:
        text = BeautifulSoup(content, "lxml").get_text()
        return text


class JsonContentParser(ContentParser):
    def get_url_fragments(self, content) -> Union[LinkInformation, None]:
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

    @abstractmethod
    def parse_text_content(self, content) -> str:
        result = self.get_url_fragments(content)
        return result.target_text if result else ""


class PDFContentParser(ContentParser):
    def get_url_fragments(self, content) -> Union[LinkInformation, None]:
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

    def parse_text_content(self, content) -> str:
        result = self.get_url_fragments(content)

        return result.target_text if result else ""


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
