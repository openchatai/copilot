from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.pdf_data_source_model import PdfDataSource
from shared.models.opencopilot_db.database_setup import engine
from shared.models.opencopilot_db.website_data_source import WebsiteDataSource
from typing import List
# Create a session to interact with the database
Session = sessionmaker(bind=engine)

def create_website_data_source(chatbot_id: str, url: str, ingest_status: str):
    Session = sessionmaker(bind=engine)
    session = Session()
    website_data_source = WebsiteDataSource(chatbot_id=chatbot_id, url=url, ingest_status=ingest_status)
    session.add(website_data_source)
    session.commit()
    return website_data_source


def update_website_data_source_status_by_url(url: str, status: str):
    Session = sessionmaker(bind=engine)
    session = Session()
    website_data_source = session.query(WebsiteDataSource).filter_by(url=url).first()
    website_data_source.ingest_status = status
    session.commit()
    return website_data_source