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
    website_data_source = WebsiteDataSource(chatbot_id=chatbot_id, url=url, status=status)
    session.add(website_data_source)
    session.commit()
    return website_data_source


def update_website_data_source_status_by_url(url: str, status: str, error: Optional[str] = None):
    Session = sessionmaker(bind=engine)
    session = Session()
    website_data_source = session.query(WebsiteDataSource).filter_by(url=url).first()
    website_data_source.status = status
    
    
    if error is not None:
      website_data_source.error = error
      
    session.commit()
    return website_data_source


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