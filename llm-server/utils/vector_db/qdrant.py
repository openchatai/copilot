# qdrant_client.py
from qdrant_client import QdrantClient
from utils.vector_db.vector_db_interface import VectorDBInterface
from dotenv import load_dotenv
import os

load_dotenv()
qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")

class QdrantVectorDBClient(VectorDBInterface):
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(QdrantVectorDBClient, cls).__new__(cls)
            cls._instance.qdrant_client = QdrantClient(qdrant_url)
        return cls._instance

    def add_data_with_meta(self, namespace, vectors, meta):
        entities = [{"vector": vector, "meta": meta} for vector in vectors]
        self.qdrant_client.upsert_entities(collection_name=namespace, entities=entities)

    def perform_search(self, namespace, query):
        search_params = {
            "collection_name": namespace,
            "top": 10,
            "query": {
                "vector": {"q": query, "top": 10},
            },
        }
        response = self.qdrant_client.search(search_params)
        return response["data"]["hits"]
    
    def delete_documents_by_workflow_id(self, namespace, workflow_id):
        filter_query = {
            "meta.workflow_id": workflow_id
        }
        self.qdrant_client.delete_entities(collection_name=namespace, filter=filter_query)