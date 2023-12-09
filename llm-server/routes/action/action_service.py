from langchain.docstore.document import Document
from typing import List
from typing import Dict, Any
from routes.action.dtos.action_dto import ActionCreate

from shared.models.opencopilot_db.action import Action
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from shared.utils.opencopilot_utils import get_vector_store
from qdrant_client import QdrantClient, models

import os
client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

actions_collection = get_vector_store(StoreOptions("actions"))



def get_action(point_id: str):
    points = client.retrieve(
        collection_name="actions",
        ids=[point_id],
    )

    return points[0]
    
    
def create_actions(actions: List[ActionCreate], bot_id: str):
    documents: List[Document] = []
    for action in actions:
        document = Document(page_content=action.description)
        document.metadata.update(action.model_dump())
        
        documents.append(document)
        
    vector_ids = actions_collection.add_documents(documents)
    return vector_ids

def create_action(action: ActionCreate):
    documents: List[Document] = []

    document = Document(page_content=action.description)
    document.metadata.update(action.model_dump())
    
    documents.append(document)
        
    vector_ids = actions_collection.add_documents(documents)
    return vector_ids


Payload = Dict[str, Any]
def get_all_actions(chatbot_id: str, limit: int= 20, offset: int = 0) -> List[Payload]:
    [records, pointId] = client.scroll(
        collection_name="actions",
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.chatbot_id",
                    match=models.MatchValue(value=str(chatbot_id)),
                )
            ],
        ),
        limit=limit,
        offset=offset,
        with_payload=True,
        with_vectors=False,
    )
    
    actions: List[Payload] = []
    for record in records:
        payload = record.payload
        
        if payload is not None:
            actions.append({"payload": payload, "id": record.id})

    return actions


def update_action(action: ActionCreate, point_id: str):
    client.set_payload(
        collection_name="actions",
        payload={
            "metadata": action
        },
        points=[point_id],
    )
    


def delete_action(point_id: str):
    client.clear_payload(
        collection_name="actions",
        points_selector=models.PointIdsList(
            points=[point_id],
        ),
    )


    