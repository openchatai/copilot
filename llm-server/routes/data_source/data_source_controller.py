from fastapi import APIRouter, HTTPException, Depends
from typing import List

from models.repository.datasource_repo import (
    get_all_pdf_datasource_by_bot_id,
    get_all_website_datasource_by_bot_id,
)

datasource_router = APIRouter()


@datasource_router.get("/b/{bot_id}")
def get_data_sources(bot_id: str, limit: int = 20, offset: int = 0) -> dict:
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
    return {"pdf_sources": pdf_sources, "web_sources": web_sources}
