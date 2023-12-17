from sqlalchemy.orm import sessionmaker

from shared.models.opencopilot_db import engine
from shared.models.opencopilot_db.analytics import Analytics


def upsert_analytics_record(chatbot_id: str, successful_operations: int, total_operations: int, logs: str = ""):
    Session = sessionmaker(bind=engine)
    session = Session()

    # Fetch the existing record, if any
    existing_record = session.query(Analytics).filter_by(chatbot_id=chatbot_id).first()

    if existing_record:
        # Increment existing values
        existing_record.successful_operations += successful_operations
        existing_record.total_operations += total_operations
        if logs:
            existing_record.logs = logs
        print("Analytics record updated for chatbot_id:", chatbot_id)
    else:
        # Create a new record
        record_to_upsert = Analytics(
            chatbot_id=chatbot_id,
            successful_operations=successful_operations,
            total_operations=total_operations,
            logs=logs
        )
        session.add(record_to_upsert)
        print("Analytics record inserted for chatbot_id:", chatbot_id)

    session.commit()
    session.close()
