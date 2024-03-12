import os
from typing import Dict, Any
from typing import List
from flask import jsonify
from werkzeug.utils import secure_filename
from utils.swagger_parser import SwaggerParser
from langchain.docstore.document import Document
from qdrant_client import models

from entities.action_entity import ActionDTO
from shared.utils.opencopilot_utils import get_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions
from utils.llm_consts import initialize_qdrant_client, VectorCollections
from utils.get_logger import SilentException
from models.repository.action_repo import create_actions as action_repo_create_action

client = initialize_qdrant_client()

actions_collection = get_vector_store(StoreOptions("actions"))


def get_action(point_id: str):
    points = client.retrieve(
        collection_name="actions",
        ids=[point_id],
    )

    return points[0]


def create_actions(actions: List[ActionDTO]):
    documents: List[Document] = []
    for action in actions:
        description = action.description if action.description else ""
        document = Document(page_content=description + action.name)
        document.metadata.update(action.model_dump())

        documents.append(document)

    vector_ids = actions_collection.add_documents(documents)
    return vector_ids


# @deprecated, using create_actions
def create_action(action: ActionDTO):
    documents: List[Document] = []

    description = str(action.description) if action.description else ""
    name = str(action.name) if action.name else ""

    document = Document(page_content=description + " " + name)

    document.metadata.update(action.model_dump())

    documents.append(document)

    vector_ids = actions_collection.add_documents(documents)
    return vector_ids


Payload = Dict[str, Any]


def get_all_actions(chatbot_id: str, limit: int = 20, offset: int = 0) -> List[Payload]:
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


def delete_all_ctions(chatbot_id: str):
    result = client.delete(
        collection_name=VectorCollections.actions,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.bot_id",
                        match=models.MatchValue(value=chatbot_id),
                    ),
                ],
            )
        ),
    )

    return result


def update_action_by_operation_id(action: ActionDTO):
    documents: List[Document] = []

    description = str(action.description) if action.description else ""
    name = str(action.name) if action.name else ""

    document = Document(page_content=name + ", " + description)

    document.metadata.update(action.model_dump())

    documents.append(document)

    delete_action_by_operation_id(
        bot_id=str(action.bot_id), operation_id=str(action.operation_id)
    )

    return create_action(action)


# def delete_action(point_id: str):
#     return client.clear_payload(
#         collection_name="actions",
#         points_selector=models.PointIdsList(
#             points=[point_id],
#         ),
#     )


def delete_action_by_operation_id(bot_id: str, operation_id: str):
    result = client.delete(
        collection_name=VectorCollections.actions,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.bot_id",
                        match=models.MatchValue(value=bot_id),
                    ),
                    models.FieldCondition(
                        key="metadata.operation_id",
                        match=models.MatchValue(value=operation_id),
                    ),
                ],
            )
        ),
    )

    return result


def read_swagger_files(swagger_content: str, chatbot_id: str):
    try:
        swagger_parser = SwaggerParser(swagger_content)
        swagger_parser.ingest_swagger_summary(chatbot_id)
        actions = swagger_parser.get_all_actions(chatbot_id)
    except Exception as e:
        SilentException.capture_exception(e)

        return (
            jsonify(
                {
                    "message": "Failed to parse Swagger file",
                    "is_error": True,
                }
            ),
            400,
        )

    is_error = False
    # Store actions in the database
    try:
        action_repo_create_action(chatbot_id, actions)
        create_actions(actions)
        return is_error
    except Exception as e:
        raise e
