import io
import json
from PyPDF2 import PdfFileReader, PdfReader
from enum import Enum

from abc import ABC, abstractmethod
from bs4 import BeautifulSoup

from utils.get_logger import CustomLogger
import requests


logger = CustomLogger(__name__)


class ContentParser(ABC):
    @abstractmethod
    def parse(self, content):
        pass


class TextContentParser(ContentParser):
    def parse(self, content):
        soup = BeautifulSoup(content, "lxml")
        text_content = " ".join(
            [
                p.text.strip()
                for p in soup.find_all(["p", "h1", "h2", "h3", "h4", "h5", "h6"])
            ]
        )
        return text_content


class JsonContentParser(ContentParser):
    def parse(self, content):
        try:
            json_data = json.loads(content)
            # Convert JSON object to a string representation
            return json.dumps(json_data, indent=2)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON content: {e}")
            return None


class PDFContentParser(ContentParser):
    def parse(self, content):
        try:
            pdf_file = PdfReader(io.BytesIO(content))
            text = ""

            for page_num in range(len(pdf_file.pages)):
                page = pdf_file.pages[page_num]
                text += page.extract_text()

            return text
        except Exception as e:
            logger.error(f"Failed to parse PDF content: {e}")
            return None


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
