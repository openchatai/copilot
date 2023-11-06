from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.pdf_data_source_model import PdfDataSource
from shared.models.opencopilot_db.database_setup import engine
# Create a session to interact with the database
Session = sessionmaker(bind=engine)

def insert_pdf_data_source(chatbot_id, files, folder_name):
    with Session() as session:
        pdf_data_source = PdfDataSource(
            chatbot_id=chatbot_id,
            files=files,
            folder_name=folder_name
        )
        session.add(pdf_data_source)
        session.commit()

def query_all_pdf_data_sources():
    with Session() as session:
        pdf_data_sources = session.query(PdfDataSource).all()
    return pdf_data_sources