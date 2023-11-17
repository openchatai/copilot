from celery import shared_task
from langchain.text_splitter import RecursiveCharacterTextSplitter
from repos.pdf_data_sources import insert_pdf_data_source, update_pdf_data_source_status

from langchain.document_loaders import PyPDFium2Loader
from shared.utils.opencopilot_utils import get_embeddings, init_vector_store, StoreOptions, get_file_path

@shared_task
def process_pdf(file_name: str, bot_id: str):
    try:
        insert_pdf_data_source(chatbot_id=bot_id, file_name=file_name, status="PENDING")
        loader = PyPDFium2Loader(get_file_path(file_name))
        raw_docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200, length_function=len
        )
        docs = text_splitter.split_documents(raw_docs)
        embeddings = get_embeddings()
        init_vector_store(docs, embeddings, StoreOptions(namespace="knowledgebase", metadata={"bot_id": bot_id}))

        update_pdf_data_source_status(chatbot_id=bot_id, file_name=file_name, status="COMPLETED")
    except Exception as e:
        update_pdf_data_source_status(chatbot_id=bot_id, file_name=file_name, status="FAILED")
        print(f"Error processing {file_name}:", e)


@shared_task
def retry_failed_pdf_crawl(chatbot_id: str, file_name: str):
    """Re-runs a failed PDF crawl.

    Args:
      chatbot_id: The ID of the chatbot.
      file_name: The name of the PDF file to crawl.
    """

    update_pdf_data_source_status(chatbot_id=chatbot_id, file_name=file_name, status="PENDING")
    try:
        process_pdf(filename=file_name, bot_id=chatbot_id)
    except Exception as e:
        update_pdf_data_source_status(chatbot_id=chatbot_id, file_name=file_name, status="FAILED")
        print(f"Error reprocessing {file_name}:", e)