from shared.models.opencopilot_db.analytics import Analytics
from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db import engine
from sqlalchemy.dialects.mysql import insert

def upsert_analytics_record(chatbot_id: str, successful_operations: int, total_operations: int, user_id: str):
    Session = sessionmaker(bind=engine)
    session = Session()

    insert_stmt = insert(Analytics).values(
        chatbot_id=chatbot_id,
        successful_operations=successful_operations,
        total_operations=total_operations,
        user_id=user_id
    )

    session.execute(insert_stmt)
    session.commit()

    if session.query(Analytics).filter_by(chatbot_id=chatbot_id).count() > 0:
        print("Analytics record updated for chatbot_id:", chatbot_id)
    else:
        print("Analytics record inserted for chatbot_id:", chatbot_id)

    session.close()