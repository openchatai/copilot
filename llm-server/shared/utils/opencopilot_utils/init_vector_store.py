import os

from langchain.docstore.document import Document
from langchain.embeddings.base import Embeddings
from langchain.vectorstores.qdrant import Qdrant

from .interfaces import StoreOptions
from .store_type import StoreType
from shared.utils.opencopilot_utils.get_vector_store import get_vector_store

def init_vector_store(docs: list[Document], options: StoreOptions) -> None:
    store_type = StoreType[os.getenv('STORE', StoreType.QDRANT.value)]

    for doc in docs:
        doc.metadata.update(options.metadata)

    if store_type == StoreType.QDRANT:
        kb_vector_store = get_vector_store(StoreOptions("knowledgebase"))
        kb_vector_store.add_documents(docs)
    else:
        valid_stores = ", ".join(StoreType._member_names())
        raise ValueError(
            f"Invalid STORE environment variable value: {os.environ['STORE']}. Valid values are: {valid_stores}")
