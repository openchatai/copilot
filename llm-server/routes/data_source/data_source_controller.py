from flask import jsonify, Blueprint, request, Response
from shared.utils.opencopilot_utils import get_vector_store
from shared.utils.opencopilot_utils.interfaces import StoreOptions

from models.repository.datasource_repo import (
    delete_knowldge_base_item_from_db,
    get_all_pdf_datasource_by_bot_id,
    get_all_website_datasource_by_bot_id,
    qdrant_delete_knowledgebase_item_by_link_and_bot_id,
)

datasource_workflow = Blueprint("datasource", __name__)

from pydantic import BaseModel, Field


class DeleteItemRequest(BaseModel):
    link: str = Field(..., description="The link of the item to delete")
    item_id: str = Field(..., description="The ID of the item to delete")


@datasource_workflow.route("/b/<bot_id>", methods=["DELETE"])
def delete_knowldge_base_item(bot_id: str):
    payload = DeleteItemRequest(**request.json)
    link = payload.link
    item_id = payload.item_id

    try:
        qdrant_delete_knowledgebase_item_by_link_and_bot_id(link, bot_id)
        delete_knowldge_base_item_from_db(item_id)
        return jsonify({"message": "Item deleted successfully."}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete item"}), 400


@datasource_workflow.route("/b/<bot_id>", methods=["GET"])
def get_data_sources(bot_id: str) -> Response:
    limit = int(request.args.get("limit", 20))
    offset = int(request.args.get("offset", 0))

    pdf_datasources = get_all_pdf_datasource_by_bot_id(bot_id, limit, offset)

    pdf_sources = []

    for ds in pdf_datasources:
        pdf_sources.append(
            {
                "id": ds.id,
                "chatbot_id": ds.created_at,
                "source": ds.file_name,
                "status": ds.status,
                "updated_at": ds.updated_at,
            }
        )

    web_sources = []
    web_datasources = get_all_website_datasource_by_bot_id(bot_id, limit, offset)

    for wds in web_datasources:
        web_sources.append(
            {
                "id": wds.id,
                "chatbot_id": wds.created_at,
                "source": wds.url,
                "status": wds.status,
                "updated_at": wds.updated_at,
            }
        )
    return jsonify({"pdf_sources": pdf_sources, "web_sources": web_sources})
