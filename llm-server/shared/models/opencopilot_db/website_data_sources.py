from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.pdf_data_source_model import PdfDataSource
from shared.models.opencopilot_db.database_setup import engine
from shared.models.opencopilot_db.website_data_source import WebsiteDataSource
from typing import List, Optional

# Create a session to interact with the database
Session = sessionmaker(bind=engine)


def create_website_data_source(chatbot_id: str, url: str, status: str):
    Session = sessionmaker(bind=engine)
    session = Session()

    # Attempt to find an existing WebsiteDataSource entry by URL
    existing_website_data_source = (
        session.query(WebsiteDataSource).filter_by(url=url).first()
    )

    if existing_website_data_source:
        # If found, update the existing entry
        existing_website_data_source.chatbot_id = chatbot_id
        existing_website_data_source.status = status
    else:
        # If not found, create a new WebsiteDataSource object and add it to the session
        new_website_data_source = WebsiteDataSource(
            chatbot_id=chatbot_id, url=url, status=status
        )
        session.add(new_website_data_source)

    # Commit the session to apply the changes
    session.commit()

    # Return the updated or newly created WebsiteDataSource object
    return (
        existing_website_data_source
        if existing_website_data_source
        else new_website_data_source
    )


def get_website_data_source_by_id(website_data_source_id: str):
    """Gets a website data source by its ID.

    Args:
      website_data_source_id: The ID of the website data source to get.

    Returns:
      The website data source, or `None` if no website data source with the given ID is found.
    """

    website_data_source = WebsiteDataSource.query(
        WebsiteDataSource.id == website_data_source_id
    ).get()

    return website_data_source


def count_crawled_pages(bot_id: str) -> int:
    Session = sessionmaker(bind=engine)
    session = Session()

    # Count the number of website data sources with the given bot id
    count = session.query(WebsiteDataSource).filter_by(chatbot_id=bot_id).count()

    return count


def upsert_website_status(chatbot_id, url: str, status: str):
    session = Session()
    website_datasource = (
        session.query(WebsiteDataSource)
        .filter_by(chatbot_id=chatbot_id, url=url)
        .first()
    )
    if website_datasource:
        website_datasource.status = status
        session.commit()
    else:
        website_datasource = WebsiteDataSource(
            chatbot_id=chatbot_id, url=url, status=status
        )
        session.add(website_datasource)
        session.commit()
    return website_datasource
