from datetime import datetime
from typing import Optional, List, Dict, Union, Tuple
from models.repository.action_call_repo import (
    count_action_calls_grouped_by_action_id_for_bot_id,
)
from shared.models.opencopilot_db import ChatHistory, engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import Integer, distinct
from sqlalchemy.orm import class_mapper
from langchain.schema import BaseMessage, AIMessage, HumanMessage
from sqlalchemy import func

from shared.models.opencopilot_db.chatbot import Chatbot
import json

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
            .order_by(ChatHistory.id.desc())
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
    chats, _ = get_all_chat_history_by_session_id_with_total(session_id, 100)
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
    bot_id: str, limit: int = 20, offset: int = 1
) -> Tuple[List[Dict[str, object]], int]:
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
                api_called=record.get("api_called"),
                knowledgebase_called=record.get("knowledgebase_called"),
            )

            session.add(chat_history)
            chat_histories.append(chat_history)
        session.commit()

    return chat_histories


async def get_analytics(chatbot_id: str):
    with Session() as session:
        chat_histories = []

        # Step 2: Get analytics data in a single query
        analytics_data = (
            session.query(
                func.sum(func.cast(ChatHistory.api_called, Integer)).label(
                    "api_called_count"
                ),
                func.sum(func.cast(ChatHistory.knowledgebase_called, Integer)).label(
                    "knowledgebase_called_count"
                ),
                func.count().label("total"),
                func.sum(
                    func.cast(
                        ~ChatHistory.api_called & ~ChatHistory.knowledgebase_called,
                        Integer,
                    )
                ).label("other_count"),
            )
            .filter(ChatHistory.chatbot_id == chatbot_id)
            .one()
        )

        # Append the results to chat_histories
        chat_histories.append(
            {
                "api_called_count": int(analytics_data.api_called_count or 0),
                "knowledgebase_called_count": int(
                    analytics_data.knowledgebase_called_count or 0
                ),
                "total": int(analytics_data.total or 0),
                "other_count": int(analytics_data.other_count or 0),
            }
        )

    return chat_histories


def get_session_counts_by_user(user_email: str):
    with Session() as session:
        bots = session.query(Chatbot.id).filter(Chatbot.email == user_email).all()
        session.close()
        bot_ids = [bot.id for bot in bots]
        result = (
            session.query(
                ChatHistory.session_id,
                func.count(ChatHistory.session_id).label("session_count"),
            )
            .filter(
                ChatHistory.chatbot_id.in_(bot_ids)
            )  # Fix: Replace bot_id with bot_ids
            .group_by(ChatHistory.session_id)
            .all()
        )

        json_result = []
        # Convert result to JSON
        for session_id, rest in result:
            json_result.append({"session_id": session_id, "session_count": rest})

        return json_result


def most_called_actions_by_bot(bot_id: str):
    rows = count_action_calls_grouped_by_action_id_for_bot_id(bot_id)

    result = []
    for operation_id, count in rows:
        result.append({"operation_id": operation_id, "count": count})

    return result
