from qdrant_client import QdrantClient, models
import os

vector_size = int(os.getenv("VECTOR_SIZE", "1536"))


def init_qdrant_collections():
    client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

    def try_create_collection(name: str, vectors_config: models.VectorParams):
        try:
            client.create_collection(name, vectors_config=vectors_config)
            client.create_payload_index(
                collection_name=name,
                field_name="bot_id",
                field_schema=models.PayloadFieldSchema.KEYWORD,
            )
        except Exception:
            print(f"{name} collection already exists, ignoring")

    vector_params = models.VectorParams(
        size=vector_size, distance=models.Distance.COSINE
    )

    try_create_collection("knowledgebase", vector_params)
    try_create_collection("swagger", vector_params)  # workflow
    try_create_collection("apis", vector_params)
