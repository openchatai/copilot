from qdrant_client import QdrantClient, models
import os

vector_size = int(os.getenv("VECTOR_SIZE", "1536"))


def init_qdrant_collections():
    # refer: from opencopilot_utils import StoreOptions, for list of namespaces to be created on startup
    client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))
    try:
        client.create_collection(
            "knowledgebase",
            vectors_config=models.VectorParams(
                size=vector_size, distance=models.Distance.COSINE
            ),
        )

        client.create_collection(
            "swagger",
            vectors_config=models.VectorParams(
                size=vector_size, distance=models.Distance.COSINE
            ),
        )
    except Exception:
        print("Collection already exists, ignoring new collection creation")
