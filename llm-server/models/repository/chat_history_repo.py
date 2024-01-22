from datetime import datetime
from typing import Optional, List, Dict, Union, Tuple
from shared.models.opencopilot_db import ChatHistory, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import distinct
from sqlalchemy.orm import class_mapper
from langchain.schema import BaseMessage, AIMessage, HumanMessage
from sqlalchemy import func

Session = sessionmaker(bind=engine)


def create_chat_history(
    chatbot_id: str,
    session_id: str,
    from_user: bool,
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

def get_all_chat_history_by_session_id_with_total(
    session_id: str, limit: int = 20, offset: int = 0
) -> Tuple[List[ChatHistory], int]:
    # Using a context manager to automatically close the session
    with Session() as session:
        # Get all chat history for the specified session
        chat_history = (
            session.query(ChatHistory)
            .filter_by(session_id=session_id)
            .order_by(ChatHistory.id.asc())
            .limit(limit)
            .offset(offset)
            .all()
        )

        # Get total number of messages for the specified session
        total_messages = (
            session.query(func.count(ChatHistory.id))
            .filter_by(session_id=session_id)
            .scalar()
        )

    return chat_history[::-1], total_messages


async def get_chat_message_as_llm_conversation(session_id: str) -> List[BaseMessage]:
    chats, total_messages = get_all_chat_history_by_session_id_with_total(session_id, 100)
    conversations: List[BaseMessage] = []
    for chat in chats:
        if chat.from_user:
            conversations.append(HumanMessage(content=str(chat.message)))
        else:
            conversations.append(AIMessage(content=str(chat.message)))

    return conversations


def get_all_chat_history(limit: int = 10, offset: int = 0) -> List[ChatHistory]:
    """Retrieves all chat history records.

    Args:
      limit: The maximum number of chat history records to retrieve.
      offset: The offset at which to start retrieving chat history records.

    Returns:
      A list of ChatHistory objects.
    """
    with Session() as session:
        chats = session.query(ChatHistory).limit(limit).offset(offset).all()
        return chats


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
        chat_history: ChatHistory = session.query(ChatHistory).get(chat_history_id)

        if not chatbot_id:
            chat_history.chatbot_id = chatbot_id
        if session_id:
            chat_history.session_id = session_id
        if from_user:
            chat_history.from_user = from_user
        if message:
            chat_history.message = message

        chat_history.updated_at = datetime.now()

        session.add(chat_history)
        session.commit()

    return chat_history


def delete_chat_history(chat_history_id: str) -> None:
    """Deletes a chat history record.

    Args:
      chat_history_id: The ID of the chat history record to delete.
    """
    with Session() as session:
        chat_history = session.query(ChatHistory).get(chat_history_id)
        session.delete(chat_history)
        session.commit()


def get_chat_history_for_retrieval_chain(
    session_id: str, limit: Optional[int] = None
) -> List[Tuple[str, str]]:
    """Fetches limited ChatHistory entries by session ID and converts to chat_history format.

    Args:
        session_id (str): The session ID to fetch chat history for
        limit (Optional[int], optional): Maximum number of entries to retrieve

    Returns:
        List[Tuple[str, str]]: List of tuples of (user_query, bot_response)
    """

    with Session() as session:
        # Query and limit results if a limit is provided
        query = (
            session.query(ChatHistory)
            .filter(ChatHistory.session_id == session_id)
            .order_by(ChatHistory.created_at.desc())
        )

        if limit:
            query = query.limit(limit)

        query = query.all()[::-1]

        chat_history: List[Tuple[str, str]] = []

        user_query: Optional[str] = None
        for entry in query:
            entry: ChatHistory

            if entry.from_user is True:
                user_query = str(entry.message)
            else:
                if user_query is not None:
                    chat_history.append((user_query, str(entry.message)))
                    user_query = None

    return chat_history


def get_unique_sessions_with_first_message_by_bot_id(
    bot_id: str, limit: int = 20, page: int = 1
) -> Tuple[List[Dict[str, object]], int]:
    # Calculate offset based on the page number and limit
    offset = (page - 1) * limit

    # Using a context manager to automatically close the session
    with Session() as session:
        # Use distinct to get unique session_ids
        unique_session_ids = (
            session.query(distinct(ChatHistory.session_id))
            .filter_by(chatbot_id=bot_id)
            .limit(limit)
            .offset(offset)
            .all()
        )

        # Get total number of unique sessions
        total_sessions = (
            session.query(func.count(distinct(ChatHistory.session_id)))
            .filter_by(chatbot_id=bot_id)
            .scalar()
        )

        result_list = []

        for session_id in unique_session_ids:
            # Get the first message in each session
            first_message = (
                session.query(ChatHistory)
                .filter_by(chatbot_id=bot_id, session_id=session_id[0])
                .order_by(ChatHistory.id.asc())
                .first()
            )

            # Convert ChatHistory object to a dictionary
            if first_message:
                first_message_dict = {
                    column.key: getattr(first_message, column.key)
                    for column in class_mapper(ChatHistory).mapped_table.columns
                }
            else:
                first_message_dict = None

            # Create a dictionary with session_id and first_message
            result_dict: Dict[str, object] = {
                "session_id": session_id[0],
                "first_message": first_message_dict,
            }

            result_list.append(result_dict)

    # Calculate total pages
    total_pages = (total_sessions + limit - 1) // limit

    return result_list, total_pages


def create_chat_histories(
    chatbot_id: str, chat_records: list[dict[str, Union[str, bool]]]
) -> list[ChatHistory]:
    """Creates multiple chat history records.
    Args:
      chatbot_id: The ID of the chatbot that sent the message.
      chat_records: A list of dictionaries containing chat records.
                    Each dictionary should have the keys 'session_id', 'from_user', and 'message'.
    Returns:
      A list of the newly created ChatHistory objects.
    """

    with Session() as session:
        chat_histories = []

        for record in chat_records:
            chat_history = ChatHistory(
                chatbot_id=chatbot_id,
                session_id=record["session_id"],
                from_user=record["from_user"],
                message=record["message"],
                debug_json=record.get("debug_json"),
            )

            session.add(chat_history)
            chat_histories.append(chat_history)
        session.commit()

    return chat_histories
