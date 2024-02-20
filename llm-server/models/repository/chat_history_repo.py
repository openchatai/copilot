from datetime import datetime
from typing import Optional, List, Dict, Tuple, Union
from shared.models.opencopilot_db.chat_history import ChatHistory
from sqlalchemy import Integer, func, distinct
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.repository.utils import session_manager
from shared.models.opencopilot_db.chatbot import Chatbot
from shared.models.opencopilot_db.action import ActionCall
from sqlalchemy.orm import class_mapper
from langchain.schema import BaseMessage, AIMessage, HumanMessage


class ChatHistoryRepo:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_chat_history(
        self,
        chatbot_id: str,
        session_id: str,
        from_user: bool,
        message: str,
    ) -> ChatHistory:
        async with session_manager(self.session) as session:
            chat_history = ChatHistory(
                chatbot_id=chatbot_id,
                session_id=session_id,
                from_user=from_user,
                message=message,
            )
            session.add(chat_history)
            await session.commit()
            return chat_history

    async def get_all_chat_history_by_session_id_with_total(
        self, session_id: str, limit: int = 20, offset: int = 0
    ):
        async with session_manager(self.session) as session:
            chat_history = (
                await session.execute(
                    select(ChatHistory)
                    .filter_by(session_id=session_id)
                    .order_by(ChatHistory.id.desc())
                    .limit(limit)
                    .offset(offset)
                )
            ).all()

            total_messages = (
                await session.execute(
                    select(func.count(ChatHistory.id)).filter_by(session_id=session_id)
                )
            ).all()

            return chat_history, total_messages

    async def get_all_chat_history(self, limit: int = 10, offset: int = 0):
        async with session_manager(self.session) as session:
            chats = (
                await session.execute(select(ChatHistory).limit(limit).offset(offset))
            ).all()
            return chats

    async def update_chat_history(
        self,
        chat_history_id: str,
        chatbot_id: Optional[str] = None,
        session_id: Optional[str] = None,
        from_user: Optional[str] = None,
        message: Optional[str] = None,
    ) -> ChatHistory:
        async with session_manager(self.session) as session:
            chat_history: ChatHistory = await session.get(ChatHistory, chat_history_id)

            if not chatbot_id:
                chat_history.chatbot_id = chatbot_id
            if session_id:
                chat_history.session_id = session_id
            if from_user:
                chat_history.from_user = from_user
            if message:
                chat_history.message = message

            chat_history.updated_at = datetime.now()

            await session.commit()
            return chat_history

    async def delete_chat_history(self, chat_history_id: str) -> bool:
        async with session_manager(self.session) as session:
            chat_history = await session.get(ChatHistory, chat_history_id)
            if chat_history is None:
                return False
            await session.delete(chat_history)
            await session.commit()
            return True

    async def get_session_counts_by_user(self, user_email: str):
        async with session_manager(self.session) as session:
            bots = await session.execute(
                select(Chatbot.id).filter(Chatbot.email == user_email)
            )
            bot_ids = [bot_id for bot_id in bots.scalars().all()]

            stmt = (
                select(
                    ChatHistory.session_id,
                    func.count(ChatHistory.session_id).label("session_count"),
                )
                .filter(ChatHistory.chatbot_id.in_(bot_ids))
                .group_by(ChatHistory.session_id)
            )

            result = await session.execute(stmt)

        json_result = []
        # Convert result to JSON
        for row in result.scalars().all():
            json_result.append(
                {"session_id": row.session_id, "session_count": row.session_count}
            )

        return json_result

    async def count_action_calls_grouped_by_action_id_for_bot_id(self, bot_id: str):
        async with session_manager(self.session) as session:
            result = await session.execute(
                select(ActionCall.operation_id, func.count(ActionCall.chatbot_id))
                .where(ActionCall.chatbot_id == bot_id)
                .group_by(ActionCall.operation_id)
                .order_by(func.count(ActionCall.chatbot_id).desc())
            )
            return result.scalars().all()

    async def most_called_actions_by_bot(self, bot_id: str):
        rows = await self.count_action_calls_grouped_by_action_id_for_bot_id(bot_id)

        result = []
        for operation_id, count in rows:
            result.append({"operation_id": operation_id, "count": count})

        return result

    async def get_analytics(self, chatbot_id: str):
        async with session_manager(self.session) as session:
            chat_histories = []

            # Step 2: Get analytics data in a single query
            stmt = select(
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
            ).where(ChatHistory.chatbot_id == chatbot_id)

            analytics_data = await session.execute(stmt)
            analytics_data = analytics_data.scalar_one()

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

    async def get_unique_sessions_with_first_message_by_bot_id(
        self, bot_id: str, limit: int = 20, offset: int = 1
    ) -> Tuple[List[Dict[str, object]], int]:
        async with session_manager(self.session) as session:
            # Use distinct to get unique session_ids
            stmt = (
                select(distinct(ChatHistory.session_id))
                .where(ChatHistory.chatbot_id == bot_id)
                .limit(limit)
                .offset(offset)
            )
            unique_session_ids = await session.execute(stmt)
            unique_session_ids = unique_session_ids.scalars().all()

            # Get total number of unique sessions
            stmt = select(func.count(distinct(ChatHistory.session_id))).where(
                ChatHistory.chatbot_id == bot_id
            )
            total_sessions = await session.execute(stmt)
            total_sessions = total_sessions.scalar_one()

            result_list = []

            for session_id in unique_session_ids:
                # Get the first message in each session
                stmt = (
                    select(ChatHistory)
                    .where(
                        ChatHistory.chatbot_id == bot_id,
                        ChatHistory.session_id == session_id,
                    )
                    .order_by(ChatHistory.id.desc())
                    .limit(1)
                )
                first_message = await session.execute(stmt)
                first_message = first_message.scalars().first()

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
                    "session_id": session_id,
                    "first_message": first_message_dict,
                }

                result_list.append(result_dict)

        # Calculate total pages
        total_pages = (total_sessions + limit - 1) // limit

        return result_list, total_pages

    async def create_chat_histories(
        self, chatbot_id: str, chat_records: list[dict[str, Union[str, bool]]]
    ) -> list[ChatHistory]:
        """Creates multiple chat history records.
        Args:
          chatbot_id: The ID of the chatbot that sent the message.
          chat_records: A list of dictionaries containing chat records.
                        Each dictionary should have the keys 'session_id', 'from_user', and 'message'.
        Returns:
          A list of the newly created ChatHistory objects.
        """
        async with session_manager(self.session) as session:
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
            await session.commit()
            await session.refresh(chat_history)

        return chat_histories

    async def get_chat_message_as_llm_conversation(
        self,
        session_id: str,
    ) -> List[BaseMessage]:
        chats, _ = await self.get_all_chat_history_by_session_id_with_total(
            session_id, 100
        )
        conversations: List[BaseMessage] = []
        for chat in chats:
            if chat.from_user:
                conversations.append(HumanMessage(content=str(chat.message)))
            else:
                conversations.append(AIMessage(content=str(chat.message)))

        return conversations
