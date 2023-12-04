from routes.workflow.dto.workflow_dto import Workflow
from shared.utils.opencopilot_utils import (
    StoreOptions,
    get_embeddings,
    init_vector_store,
)
from typing import Any
from opencopilot_types.workflow_type import WorkflowDataType
from shared.utils.opencopilot_utils import StoreOptions, get_embeddings, init_vector_store
from langchain.docstore.document import Document


def add_workflow_data_to_qdrant(
    workflow_id: str, workflow_data: Workflow, bot_id: str
) -> None:
    docs = [
        Document(
            page_content=workflow_data.info.get("title", ""),
            metadata={
                "workflow_id": str(workflow_id),
                "workflow_name": workflow_data.name,
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
