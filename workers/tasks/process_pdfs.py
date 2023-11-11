from celery import shared_task
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFium2Loader
from repos.pdf_data_sources import insert_pdf_data_source

from langchain.document_loaders import PyPDFium2Loader
from shared.utils.opencopilot_utils import get_embeddings, init_vector_store, StoreOptions, get_file_path

@shared_task
def process_pdf(filename: str, bot_id: str):
    try:
        loader = PyPDFium2Loader(get_file_path(filename))
        raw_docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=200, length_function=len
        )
        docs = text_splitter.split_documents(raw_docs)
        embeddings = get_embeddings()
        init_vector_store(docs, embeddings, StoreOptions(namespace=bot_id))

        insert_pdf_data_source(chatbot_id=bot_id, files=filename, folder_name=bot_id)
    except Exception as e:
        print(f"Error processing {filename}:", e)
