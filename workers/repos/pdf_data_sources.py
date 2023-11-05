from sqlalchemy import Engine
from sqlalchemy.orm import sessionmaker
from models.pdf_data_source_model import PdfDataSource

# Create a session to interact with the database
Session = sessionmaker(bind=Engine)
session = Session()

# Perform database operations
def insert_pdf_data_source(chatbot_id, files, folder_name):
    pdf_data_source = PdfDataSource(
        chatbot_id=chatbot_id,
        files=files,
        folder_name=folder_name
    )
    session.add(pdf_data_source)
    session.commit()

def query_all_pdf_data_sources():
    pdf_data_sources = session.query(PdfDataSource).all()
    return pdf_data_sources

def close_session():
    session.close()
