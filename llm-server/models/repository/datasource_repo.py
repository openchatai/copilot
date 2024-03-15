from typing import List
from shared.models.opencopilot_db import engine
from shared.models.opencopilot_db import PdfDataSource, WebsiteDataSource
from sqlalchemy.orm import sessionmaker
from qdrant_client import models
from utils.llm_consts import initialize_qdrant_client, VectorCollections

client = initialize_qdrant_client()

Session = sessionmaker(bind=engine)


def get_all_pdf_datasource_by_bot_id(
    bot_id: str, limit: int = 20, offset: int = 0
) -> List[PdfDataSource]:
    session = Session()
    datasources = (
        session.query(PdfDataSource)
        .filter_by(chatbot_id=bot_id)
        .order_by(PdfDataSource.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return datasources


def qdrant_delete_knowledgebase_item_by_link_and_bot_id(link: str, bot_id: str):
    result = client.delete(
        collection_name=VectorCollections.knowledgebase,
        points_selector=models.FilterSelector(
            filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="metadata.link",
                        match=models.MatchValue(value=link),
                    ),
                    models.FieldCondition(
                        key="metadata.bot_id",
                        match=models.MatchValue(value=bot_id),
                    ),
                ],
            )
        ),
    )

    return result


def get_all_website_datasource_by_bot_id(
    bot_id: str, limit: int = 20, offset: int = 0
) -> List[WebsiteDataSource]:
    session = Session()
    datasources = (
        session.query(WebsiteDataSource)
        .filter_by(chatbot_id=bot_id)
        .order_by(WebsiteDataSource.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    return datasources


def delete_knowldge_base_item_from_db(item_id: str) -> None:
    with Session() as session:
        session.query(PdfDataSource).filter_by(id=item_id).delete()
        session.query(WebsiteDataSource).filter_by(id=item_id).delete()
        session.commit()
