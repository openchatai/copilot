from typing import Any
from opencopilot_types.workflow_type import WorkflowDataType
from opencopilot_utils import StoreOptions, get_embeddings, init_vector_store
from langchain.docstore.document import Document


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
