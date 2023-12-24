import os

from langchain.vectorstores.qdrant import Qdrant
from langchain.vectorstores.base import VectorStore
from .store_type import StoreType
from .interfaces import StoreOptions
from .get_embeddings import get_embeddings
from utils.llm_consts import initialize_qdrant_client


embedding = get_embeddings()
client = initialize_qdrant_client()


def get_vector_store(options: StoreOptions) -> VectorStore:
    """Gets the vector store for the given options."""
    vector_store: VectorStore

    store_type = StoreType[os.environ.get("STORE", StoreType.QDRANT.value)]

    if store_type == StoreType.QDRANT:
        vector_store = Qdrant(
            client, collection_name=options.namespace, embeddings=embedding
        )

        # vector_store = Qdrant.from_documents([], embedding, url='http://localhost:6333', collection=options.namespace)

    else:
        raise ValueError("Invalid STORE environment variable value")

    return vector_store
