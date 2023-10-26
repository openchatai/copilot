from typing import Any
from opencopilot_types.workflow_type import WorkflowDataType
from utils.vector_db.store_options import StoreOptions
from langchain.docstore.document import Document
from utils.get_embeddings import get_embeddings
from utils.vector_db.init_vector_store import init_vector_store


def add_workflow_data_to_qdrant(
    workflow_id: str, workflow_data: WorkflowDataType, swagger_url: str
) -> None:
    docs = [
        Document(
            page_content=workflow_data["info"]["title"],
            metadata={
                "workflow_id": str(workflow_id),
                "workflow_name": workflow_data.get("name"),
                "swagger_id": workflow_data.get("swagger_id"),
                "swagger_url": swagger_url,
            },
        )
    ]
    embeddings = get_embeddings()
    init_vector_store(docs, embeddings, StoreOptions(swagger_url))
