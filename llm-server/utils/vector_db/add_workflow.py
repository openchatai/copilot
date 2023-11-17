from typing import Any
from opencopilot_types.workflow_type import WorkflowDataType
from opencopilot_utils import StoreOptions, get_embeddings, init_vector_store
from langchain.docstore.document import Document


def add_workflow_data_to_qdrant(
    workflow_id: str, workflow_data: WorkflowDataType, bot_id: str
) -> None:
    docs = [
        Document(
            page_content=workflow_data["info"]["title"],
            metadata={
                "workflow_id": str(workflow_id),
                "workflow_name": workflow_data.get("name"),
                "swagger_id": workflow_data.get("swagger_id"),
                "bot_id": bot_id,
            },
        )
    ]
    embeddings = get_embeddings()
    init_vector_store(
        docs,
        embeddings,
        StoreOptions(
            namespace="swagger",
            metadata={
                "bot_id": bot_id
                # "swagger_id": workflow_data.get("swagger_id"),
            },
        ),
    )
