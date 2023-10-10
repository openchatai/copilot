from datetime import datetime
from typing import Optional, cast
from app import db
from models.chat_history import ChatHistory


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

    chat_history = ChatHistory(
        chatbot_id=chatbot_id,
        session_id=session_id,
        from_user=from_user,
        message=message,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )
    db.session.add(chat_history)
    db.session.commit()
    return chat_history


def read_chat_history(chat_history_id: Optional[str] = None) -> List[ChatHistory]:
    """Retrieves chat history records.

    Args:
      chat_history_id: The ID of the chat history record to retrieve. If None,
        all chat history records will be retrieved.

    Returns:
      A list of ChatHistory objects.
    """

    if chat_history_id:
        return ChatHistory.query.get(chat_history_id)
    else:
        return ChatHistory.query.all()


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

    chat_history = ChatHistory.query.get(chat_history_id)
    chat_history.chatbot_id = chatbot_id or chat_history.chatbot_id
    chat_history.session_id = session_id or chat_history.session_id
    chat_history.from_user = from_user or chat_history.from_user
    chat_history.message = message or chat_history.message
    chat_history.updated_at = datetime.now()
    db.session.commit()
    return cast(ChatHistory, chat_history)


def delete_chat_history(chat_history_id: str) -> None:
    """Deletes a chat history record.

    Args:
      chat_history_id: The ID of the chat history record to delete.
    """

    chat_history = ChatHistory.query.get(chat_history_id)
    db.session.delete(chat_history)
    db.session.commit()
