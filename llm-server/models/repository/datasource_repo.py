from datetime import datetime
from typing import Optional, cast, List
from opencopilot_db import ChatHistory, engine
from opencopilot_db import PdfDataSource, WebsiteDataSource
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import Optional, Tuple

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

    # Sort the chat history records by created_at in descending order.
    datasources.sort(key=lambda source: source.created_at)

    return datasources


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

    # Sort the chat history records by created_at in descending order.
    datasources.sort(key=lambda source: source.created_at)

    return datasources
