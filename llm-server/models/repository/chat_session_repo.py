from sqlalchemy.exc import NoResultFound
from flask import jsonify
from shared.models.opencopilot_db.chat_history import ChatSessions
from shared.models.opencopilot_db.chatbot import Chatbot, engine
from sqlalchemy.orm import sessionmaker

# Create a Session factory
SessionLocal = sessionmaker(bind=engine)


def create_session_summary(session_id: str, summary: str = ""):
    try:
        with SessionLocal() as db:
            session_summary = ChatSessions(id=session_id, summary=summary)
            db.add(session_summary)
            db.commit()
            db.refresh(session_summary)
            return session_summary
    except Exception as e:
        print(f"Error creating session summary: {e}")
        return jsonify({"error": "Internal server error"}), 500


def get_session_summary(session_id: str):
    try:
        with SessionLocal() as db:
            session_summary = (
                db.query(ChatSessions).filter(ChatSessions.id == session_id).first()
            )
            if not session_summary:
                return (
                    jsonify(
                        {
                            "error": f"Session summary not found for session ID: {session_id}"
                        }
                    ),
                    404,
                )
            return session_summary
    except Exception as e:
        print(f"Error retrieving session summary: {e}")
        return jsonify({"error": "Internal server error"}), 500


def get_all_session_summaries():
    try:
        with SessionLocal() as db:
            session_summaries = db.query(ChatSessions).all()
            return session_summaries
    except Exception as e:
        print(f"Error retrieving all session summaries: {e}")
        return jsonify({"error": "Internal server error"}), 500


def update_session_summary(session_id: str, updated_summary: str):
    try:
        with SessionLocal() as db:
            session_summary = (
                db.query(ChatSessions).filter(ChatSessions.id == session_id).first()
            )
            if not session_summary:
                return (
                    jsonify(
                        {
                            "error": f"Session summary not found for session ID: {session_id}"
                        }
                    ),
                    404,
                )
            session_summary.summary = updated_summary
            db.commit()
            db.refresh(session_summary)
            return session_summary
    except Exception as e:
        db.rollback()
        print(f"Error updating session summary: {e}")
        return jsonify({"error": "Internal server error"}), 500


def delete_session_summary(session_id: str):
    try:
        with SessionLocal() as db:
            session_summary = (
                db.query(ChatSessions).filter(ChatSessions.id == session_id).first()
            )
            if not session_summary:
                return (
                    jsonify(
                        {
                            "error": f"Session summary not found for session ID: {session_id}"
                        }
                    ),
                    404,
                )
            db.delete(session_summary)
            db.commit()
            return jsonify(
                {"message": f"Session summary deleted for session ID: {session_id}"}
            )
    except Exception as e:
        db.rollback()
        print(f"Error deleting session summary: {e}")
        return jsonify({"error": "Internal server error"}), 500


def find_one_or_fail_by_id(bot_id: str) -> Chatbot:
    """
    Finds a Chatbot instance by its ID. Raises an exception if the Chatbot is not found.
    Args:
        bot_id (str): The unique identifier of the Chatbot.
    Returns:
        Chatbot: The found Chatbot instance.
    Raises:
        ValueError: If no Chatbot is found with the provided ID.
        Exception: If any other exception occurs during the database operation.
    """
def find_one_or_fail_by_id(bot_id: str) -> Chatbot:
    try:
        with SessionLocal() as session:
            bot = session.query(Chatbot).filter(Chatbot.id == str(bot_id)).one()
            return bot
    except NoResultFound:
        print(f"No Chatbot found with id: {bot_id}")
        return jsonify({"error": "Chatbot not found"}), 404
