from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.pdf_data_source_model import PdfDataSource
from shared.models.opencopilot_db.database_setup import engine
from typing import List

# Create a session to interact with the database
Session = sessionmaker(bind=engine)


def insert_pdf_data_source(chatbot_id: str, file_name: str, status: str):
    with Session() as session:
        pdf_data_source = PdfDataSource(
            chatbot_id=chatbot_id, file_name=file_name, status=status
        )
        session.add(pdf_data_source)
        session.commit()


def update_pdf_data_source_status(chatbot_id: str, file_name: str, status: str):
    with Session() as session:
        pdf_data_source = (
            session.query(PdfDataSource)
            .filter_by(chatbot_id=chatbot_id, file_name=file_name)
            .first()
        )
        if pdf_data_source is None:
            raise ValueError(
                "PDF data source with chatbot ID {} and file name {} does not exist".format(
                    chatbot_id, file_name
                )
            )

        pdf_data_source.status = status

        session.commit()


def query_all_pdf_data_sources():
    with Session() as session:
        pdf_data_sources = session.query(PdfDataSource).all()
    return pdf_data_sources
