import os
from langchain.vectorstores.pinecone import Pinecone

from langchain.vectorstores.qdrant import Qdrant
from langchain.vectorstores.base import VectorStore

from shared.utils.opencopilot_utils.configs import ENV_CONFIGS
from .store_type import StoreType
from .interfaces import StoreOptions
from .get_embeddings import get_embeddings

import qdrant_client


def get_vector_store(options: StoreOptions) -> VectorStore:
    """Gets the vector store for the given options."""
    vector_store: VectorStore
    embedding = get_embeddings()

    store_type = os.environ.get("STORE")

    if store_type == StoreType.QDRANT.value:
        client = qdrant_client.QdrantClient(
            url=ENV_CONFIGS.QDRANT_URL,
            prefer_grpc=True,
            api_key=os.getenv("QDRANT_API_KEY", None),
        )

        vector_store = Qdrant(
            client, collection_name=options.namespace, embeddings=embedding
        )
        # vector_store = Qdrant.from_documents([], embedding, url='http://localhost:6333', collection=options.namespace)

    else:
        raise ValueError("Invalid STORE environment variable value")

    return vector_store
