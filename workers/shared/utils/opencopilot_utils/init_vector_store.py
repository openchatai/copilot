from langchain.docstore.document import Document
from langchain.vectorstores.qdrant import Qdrant
from .store_type import StoreType
from langchain.embeddings.openai import OpenAIEmbeddings
from .interfaces import StoreOptions
import os

def init_vector_store(docs: list[Document], embeddings: OpenAIEmbeddings, options: StoreOptions) -> None:
    store_type = StoreType[os.environ['STORE']]
    if store_type == StoreType.QDRANT:
        print("called qdrant.from_documents")
        Qdrant.from_documents(docs, embeddings, collection_name=options.namespace, url=os.environ['QDRANT_URL'])
    else:
        valid_stores = ", ".join(StoreType._member_names())
        raise ValueError(f"Invalid STORE environment variable value: {os.environ['STORE']}. Valid values are: {valid_stores}")