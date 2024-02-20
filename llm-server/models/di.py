from models.repository.action_call_repo import ActionCallRepository
from models.repository.api_call_repository import APICallRepository

from models.repository.chat_history_repo import ChatHistoryRepo
from models.repository.datasource_repo import DataSourceRepository
from models.repository.copilot_repo import CopilotRepository
from models.repository.action_repo import ActionRepository
from models.repository.flow_repo import FlowRepository
from models.repository.powerup_repo import PowerUpRepository
from models.repository.utils import session_manager
from shared.models.opencopilot_db.database_setup import get_db_session

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession


def get_api_call_repository(
    session: AsyncSession = Depends(session_manager),
):
    return APICallRepository(session)


def get_chat_history_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return ChatHistoryRepo(session)


def get_datasource_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return DataSourceRepository(session)


def get_copilot_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return CopilotRepository(session)


def get_action_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return ActionRepository(session)


def get_action_call_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return ActionCallRepository(session)


def get_flow_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return FlowRepository(session)


def get_powerup_repository(
    session: AsyncSession = Depends(get_db_session),
):
    return PowerUpRepository(session)
