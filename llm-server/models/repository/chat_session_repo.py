from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.exceptions import NotFound
from ...shared.models.opencopilot_db.chat_history import SessionSummary


def create_session_summary(db_session: Session, session_id: str, summary: str = ""):
    try:
        new_summary = SessionSummary(session_id=session_id, summary=summary)
        db_session.add(new_summary)
        db_session.commit()
        return new_summary
    except SQLAlchemyError as e:
        db_session.rollback()
        raise e


def get_session_summary(db_session: Session, session_id: str):
    return db_session.query(SessionSummary).filter_by(session_id=session_id).first()


def get_session_summary_or_fail(db_session: Session, session_id: str):
    summary = get_session_summary(db_session, session_id)
    if not summary:
        raise NotFound(
            description=f"No SessionSummary found with session_id: {session_id}"
        )
    return summary


def update_session_summary(db_session: Session, session_id: str, summary: str = ""):
    session_summary = get_session_summary(db_session, session_id)
    if session_summary:
        session_summary.summary = summary
        db_session.commit()
        return session_summary
    else:
        raise NotFound(
            description=f"No SessionSummary found with session_id: {session_id}"
        )


def delete_session_summary(db_session: Session, session_id: str):
    session_summary = get_session_summary(db_session, session_id)
    if session_summary:
        db_session.delete(session_summary)
        db_session.commit()
        return True
    else:
        raise NotFound(
            description=f"No SessionSummary found with session_id: {session_id}"
        )
