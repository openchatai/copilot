from celery import shared_task
from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain.document_loaders import PyPDFLoader
from shared.models.opencopilot_db.pdf_data_sources import (
    insert_pdf_data_source,
    update_pdf_data_source_status,
)
from shared.utils.opencopilot_utils import (
    get_embeddings,
    StoreOptions,
    get_file_path,
)
from shared.utils.opencopilot_utils import get_vector_store
from utils.get_logger import CustomLogger
from workers.utils.remove_escape_sequences import remove_escape_sequences

logger = CustomLogger(module_name=__name__)

embeddings = get_embeddings()
kb_vector_store = get_vector_store(StoreOptions("knowledgebase"))


@shared_task
def process_pdf(file_name: str, bot_id: str):
    try:
        # logger.info(
        #     "Pdf task picked up filename: {}, bot_id: {}".format(file_name, bot_id)
        # )
        insert_pdf_data_source(chatbot_id=bot_id, file_name=file_name, status="PENDING")
        loader = PyPDFLoader(get_file_path(file_name))
        raw_docs = loader.load()

        # clean text
        for doc in raw_docs:
            logger.info("before_cleanup", page_content=doc.page_content)
            doc.page_content = remove_escape_sequences(doc.page_content)
            logger.info("after_cleanup", page_content=doc.page_content)

        # clean the data received from pdf document before passing it
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200, length_function=len
        )
        docs = text_splitter.split_documents(raw_docs)

        for doc in docs:
            doc.metadata["bot_id"] = bot_id

        kb_vector_store.add_documents(docs)
        update_pdf_data_source_status(
            chatbot_id=bot_id, file_name=file_name, status="COMPLETED"
        )
    except Exception as e:
        logger.error("PDF_CRAWL_ERROR", error=e)
        update_pdf_data_source_status(
            chatbot_id=bot_id, file_name=file_name, status="FAILED"
        )


@shared_task
def retry_failed_pdf_crawl(chatbot_id: str, file_name: str):
    """Re-runs a failed PDF crawl.

    Args:
      chatbot_id: The ID of the chatbot.
      file_name: The name of the PDF file to crawl.
    """

    update_pdf_data_source_status(
        chatbot_id=chatbot_id, file_name=file_name, status="PENDING"
    )
    try:
        process_pdf(file_name=file_name, bot_id=chatbot_id)
    except Exception as e:
        update_pdf_data_source_status(
            chatbot_id=chatbot_id, file_name=file_name, status="FAILED"
        )
        print(f"Error reprocessing {file_name}:", e)
