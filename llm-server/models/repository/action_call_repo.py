from typing import List
from shared.models.opencopilot_db.action import Action, ActionCall
from sqlalchemy import func

from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db import engine

Session = sessionmaker(bind=engine)


def add_action_call(operation_id: str, session_id: str, bot_id: str) -> Action:
    action_call = ActionCall(
        operation_id=operation_id,
        session_id=session_id,
        chatbot_id=bot_id,
    )

    with Session() as session:
        session.add(action_call)
        session.commit()
        return action_call


def get_action_call_by_id(action_id: str) -> Action:
    with Session() as session:
        return session.query(Action).filter(Action.id == action_id).first()


def get_actions_by_chatbot_id(chatbot_id: str) -> List[Action]:
    with Session() as session:
        return session.query(Action).filter(Action.bot_id == chatbot_id).all()


def count_action_id_for_bot_id(bot_id: str) -> int:
    with Session() as session:
        return session.query(Action).filter(Action.bot_id == bot_id).count()


def count_action_id_for_session_id(session_id: str) -> int:
    with Session() as session:
        return session.query(Action).filter(Action.session_id == session_id).count()


def count_action_calls_grouped_by_action_id_for_bot_id(bot_id: str):
    with Session() as session:
        result = (
            session.query(ActionCall.operation_id, func.count(ActionCall.operation_id))
            .filter(ActionCall.chatbot_id == bot_id)
            .group_by(ActionCall.operation_id)
            .order_by(func.count(ActionCall.chatbot_id).desc())
            .all()
        )
        return result
