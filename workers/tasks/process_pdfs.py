from celery import shared_task
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFium2Loader
from repos.pdf_data_sources import insert_pdf_data_source

from shared_libs.get_embeddings import get_embeddings
from shared_libs.interfaces import StoreOptions
from shared_libs.init_vector_store import init_vector_store
from langchain.document_loaders import PyPDFium2Loader

# @Todo: add the url in the filename in the context of vectordatabase and also mongo/sql, we need to check if this file exists in the metadata, if yes we delete and reindex it. This will also be helpful in migrations
@shared_task
def process_pdf(url: str, bot_id: str):
    try:
        loader = PyPDFium2Loader(url)
        raw_docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200, length_function=len)
        docs = text_splitter.split_documents(raw_docs)
        embeddings = get_embeddings()
        init_vector_store(docs, embeddings, StoreOptions(namespace=bot_id))

        insert_pdf_data_source(chatbot_id=bot_id, files=url, folder_name=bot_id)
    except Exception as e:
        print(f"Error processing {url}:", e)
