from datetime import datetime
from typing import Optional, cast, List
from opencopilot_db import ChatHistory, engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from typing import Optional


Session = sessionmaker(bind=engine)


def create_chat_history(
    chatbot_id: str,
    session_id: str,
    from_user: str,
    message: str,
) -> ChatHistory:
    """Creates a new chat history record.

    Args:
      chatbot_id: The ID of the chatbot that sent the message.
      session_id: The ID of the chat session.
      from_user: The user who sent the message.
      message: The message content.

    Returns:
      The newly created ChatHistory object.
    """

    with Session() as session:
        chat_history = ChatHistory(
            chatbot_id=chatbot_id,
            session_id=session_id,
            from_user=from_user,
            message=message,
        )

        session.add(chat_history)
        session.commit()

    return chat_history


def get_all_chat_history_by_session_id(
    session_id: str, limit: int = 20, offset: int = 0
) -> List[ChatHistory]:
    """Retrieves all chat history records for a given session ID, sorted by created_at in descending order (most recent first).

    Args:
      session_id: The ID of the session to retrieve chat history for.
      limit: The maximum number of chat history records to retrieve.
      offset: The offset at which to start retrieving chat history records.

    Returns:
      A list of ChatHistory objects, sorted by created_at in descending order.
    """

    chats = (
        ChatHistory.query.filter_by(session_id=session_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    # Sort the chat history records by created_at in descending order.
    chats.sort(key=lambda chat: chat.created_at)

    return cast(List[ChatHistory], chats)


def get_all_chat_history(limit: int = 10, offset: int = 0) -> List[ChatHistory]:
    """Retrieves all chat history records.

    Args:
      limit: The maximum number of chat history records to retrieve.
      offset: The offset at which to start retrieving chat history records.

    Returns:
      A list of ChatHistory objects.
    """

    chats = ChatHistory.query.limit(limit).offset(offset).all()
    return cast(List[ChatHistory], chats)


def update_chat_history(
    chat_history_id: str,
    chatbot_id: Optional[str] = None,
    session_id: Optional[str] = None,
    from_user: Optional[str] = None,
    message: Optional[str] = None,
) -> ChatHistory:
    """Updates a chat history record.

    Args:
      chat_history_id: The ID of the chat history record to update.
      chatbot_id: The new chatbot ID.
      session_id: The new session ID.
      from_user: The new user name.
      message: The new message content.

    Returns:
      The updated ChatHistory object.
    """
    with Session() as session:
        chat_history = ChatHistory.query.get(chat_history_id)
        chat_history.chatbot_id = chatbot_id or chat_history.chatbot_id
        chat_history.session_id = session_id or chat_history.session_id
        chat_history.from_user = from_user or chat_history.from_user
        chat_history.message = message or chat_history.message
        chat_history.updated_at = datetime.now()

        session.add(chat_history)
        session.commit()
    return cast(ChatHistory, chat_history)


def delete_chat_history(chat_history_id: str) -> None:
    """Deletes a chat history record.

    Args:
      chat_history_id: The ID of the chat history record to delete.
    """
    with Session() as session:
        chat_history = ChatHistory.query.get(chat_history_id)
        session.delete(chat_history)
        session.commit()
