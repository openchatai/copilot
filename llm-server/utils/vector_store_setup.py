from qdrant_client import QdrantClient, models
import os

import qdrant_client

from utils.llm_consts import VectorCollections, initialize_qdrant_client

vector_size = int(os.getenv("VECTOR_SIZE", "1536"))

client = initialize_qdrant_client()


def delete_collection(name: str):
    client.delete_collection(name)


def try_create_collection(name: str, vectors_config: models.VectorParams):
    try:
        client.create_collection(name, vectors_config=vectors_config)
        client.create_payload_index(
            collection_name=name,
            field_name="metadata.bot_id",
            field_schema=models.PayloadFieldSchema.KEYWORD,
        )
    except Exception:
        print(f"{name} collection already exists, ignoring")


# quick fix, connect to the try_create_collection function
def try_create_neural_search_collection(name: str, vector_params: models.VectorParams):
    try:
        client.create_collection(
            collection_name=name,
            vectors_config={
                "title": vector_params,
                "description": vector_params,
            },
        )

        client.create_payload_index(
            collection_name=name,
            field_name="metadata.bot_id",
            field_schema=models.PayloadFieldSchema.KEYWORD,
        )
    except Exception:
        print(f"{name} collection already exists, ignoring")


vector_params = models.VectorParams(size=vector_size, distance=models.Distance.COSINE)


def init_qdrant_collections():
    try_create_collection(VectorCollections.knowledgebase, vector_params)
    try_create_collection(VectorCollections.actions, vector_params)
    try_create_collection(VectorCollections.flows, vector_params)
    try_create_collection(VectorCollections.flows, vector_params)
    try_create_neural_search_collection(VectorCollections.neural_search, vector_params)
