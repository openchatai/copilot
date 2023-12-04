from routes.workflow.dto.workflow_dto import Workflow
from shared.utils.opencopilot_utils import StoreOptions, get_vector_store
from typing import List
from langchain.docstore.document import Document


def add_workflow_data_to_qdrant(
    workflow_id: str, workflow_data: Workflow, bot_id: str
) -> List[str]:
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
    vector_store = get_vector_store(StoreOptions("swagger"))

    vector_ids = vector_store.add_documents(docs)
    return vector_ids
