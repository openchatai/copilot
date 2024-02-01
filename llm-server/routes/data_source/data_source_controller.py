from flask import jsonify, Blueprint, request, Response

from models.repository.datasource_repo import (
    get_all_pdf_datasource_by_bot_id,
    get_all_website_datasource_by_bot_id,
)

datasource_workflow = Blueprint("datasource", __name__)


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
