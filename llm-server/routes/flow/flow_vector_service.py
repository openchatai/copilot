import os
from typing import Dict, Any
from typing import List

from langchain.docstore.document import Document
from qdrant_client import models

from entities.flow_entity import FlowDTO
from shared.utils.opencopilot_utils import get_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from utils.llm_consts import initialize_qdrant_client

client = initialize_qdrant_client()

flows_collection = get_vector_store(StoreOptions("flows"))


def get_action(point_id: str):
    points = client.retrieve(
        collection_name="flows",
        ids=[point_id],
    )

    return points[0]


def get_flow_point_id_by_flow_id(flow_id: str):
    [records, point_id] = client.scroll(
        collection_name="flows",
        scroll_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.flow_id",
                    match=models.MatchValue(value=str(flow_id)),
                )
            ],
        ),
        limit=1,
        offset=0,
        with_payload=True,
        with_vectors=False,
    )
    return point_id


def create_flow(flow: FlowDTO):
    documents: List[Document] = []

    document = Document(page_content=flow.description + " " + flow.name)
    document.metadata.update(
        {
            "bot_id": str(flow.bot_id),
            "flow_id": str(flow.id),
            "operation_id": flow.operation_id,
        }
    )

    documents.append(document)

    vector_ids = flows_collection.add_documents(documents)
    return vector_ids


Payload = Dict[str, Any]


def get_all_flows(chatbot_id: str, limit: int = 20, offset: int = 0) -> List[Payload]:
    [records, pointId] = client.scroll(
        collection_name="flows",
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


def delete_flow(point_id: str):
    client.clear_payload(
        collection_name="flows",
        points_selector=models.PointIdsList(
            points=[point_id],
        ),
    )
