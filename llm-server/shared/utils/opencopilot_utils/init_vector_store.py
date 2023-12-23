import os

from langchain.docstore.document import Document
from langchain.embeddings.base import Embeddings
from langchain.vectorstores.qdrant import Qdrant

from .interfaces import StoreOptions
from .store_type import StoreType


def init_vector_store(docs: list[Document], embeddings: Embeddings, options: StoreOptions) -> None:
    store_type = StoreType[os.getenv('STORE', StoreType.QDRANT.value)]

    for doc in docs:
        doc.metadata.update(options.metadata)

    if store_type == StoreType.QDRANT:
        Qdrant.from_documents(docs, embeddings, collection_name=options.namespace, url=os.environ['QDRANT_URL'])
    else:
        valid_stores = ", ".join(StoreType._member_names())
        raise ValueError(
            f"Invalid STORE environment variable value: {os.environ['STORE']}. Valid values are: {valid_stores}")
