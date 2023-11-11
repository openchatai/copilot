from datetime import datetime
from typing import Optional, cast, List
from opencopilot_db import ChatHistory, engine
from opencopilot_db.pdf_data_source_model import PdfDataSource
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import Optional, Tuple

Session = sessionmaker(bind=engine)


def get_all_datasource_by_bot_id(
    bot_id: str, limit: int = 20, offset: int = 0
) -> List[ChatHistory]:
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
