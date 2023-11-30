from qdrant_client import QdrantClient, models
import os

vector_size = int(os.getenv("VECTOR_SIZE", "1536"))


def init_qdrant_collections():
    client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

    def try_create_collection(name, vectors_config):
        try:
            client.create_collection(name, vectors_config=vectors_config)
        except Exception:
            print(f"{name} collection already exists, ignoring")

    vector_params = models.VectorParams(
        size=vector_size, distance=models.Distance.COSINE
    )

    try_create_collection("knowledgebase", vector_params)
    try_create_collection("flows", vector_params)
    try_create_collection("apis", vector_params)
