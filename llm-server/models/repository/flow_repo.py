from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.repository.utils import session_manager
from typing import Optional, Type
from sqlalchemy import delete
from entities.flow_entity import FlowDTO
from shared.models.opencopilot_db.flow import Flow
from shared.models.opencopilot_db.flow_variables import FlowVariable
from shared.models.opencopilot_db.chatbot import Chatbot


class FlowRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_flow(self, flow_dto: FlowDTO) -> Flow:
        blocks_json = [block.model_dump() for block in flow_dto.blocks]

        async with session_manager(self.session) as session:
            new_flow = Flow(
                chatbot_id=flow_dto.bot_id,
                name=flow_dto.name,
                payload=blocks_json,
                description=flow_dto.description,
                operation_id=flow_dto.operation_id,
                id=flow_dto.id,
            )

            session.add(new_flow)
            await session.commit()
            await session.refresh(new_flow)
            return new_flow

    async def update_flow(self, flow_id: str, flow_dto: FlowDTO) -> Type[Flow]:
        blocks_json = [block.model_dump() for block in flow_dto.blocks]

        async with session_manager(self.session) as session:
            stmt = select(Flow).where(Flow.id == flow_id)
            result = await session.execute(stmt)
            flow = result.scalars().first()
            if flow:
                flow.name = flow_dto.name
                flow.payload = blocks_json
                flow.description = flow_dto.description
                await session.commit()
                await session.refresh(flow)
                return flow
            return None

    async def get_all_flows_for_bot(self, bot_id: str):
        async with session_manager(self.session) as session:
            stmt = select(Flow).where(Flow.chatbot_id == bot_id)
            result = await session.execute(stmt)
            return result.scalars().all()

    async def get_flow_by_id(self, flow_id: str) -> Optional[Flow]:
        async with session_manager(self.session) as session:
            stmt = select(Flow).where(Flow.id == str(flow_id))
            result = await session.execute(stmt)
            return result.scalars().first()

    async def get_variables_for_flow(self, flow_id: str):
        async with session_manager(self.session) as session:
            stmt = select(FlowVariable).where(FlowVariable.flow_id == flow_id)
            result = await session.execute(stmt)
            return result.scalars().all()

    async def add_or_update_variable_in_flow(
        self,
        bot_id: str,
        flow_id: str,
        name: str,
        value: str,
        runtime_override_key: str = None,
        runtime_override_action_id: str = None,
    ) -> FlowVariable:
        async with session_manager(self.session) as session:
            stmt = select(FlowVariable).where(
                FlowVariable.bot_id == bot_id,
                FlowVariable.flow_id == flow_id,
                FlowVariable.name == name,
                FlowVariable.runtime_override_action_id == runtime_override_action_id,
                FlowVariable.runtime_override_key == runtime_override_key,
            )
            result = await session.execute(stmt)
            variable = result.scalars().first()
            if variable:
                variable.value = value
            else:
                variable = FlowVariable(
                    bot_id=bot_id,
                    flow_id=flow_id,
                    name=name,
                    runtime_override_action_id=runtime_override_action_id,
                    runtime_override_key=runtime_override_key,
                )
                session.add(variable)
            await session.commit()
            return variable

    async def get_owned_flow(self, flow_id: str, user_id: str) -> Optional[Flow]:
        async with session_manager(self.session) as session:
            stmt = (
                select(Flow)
                .join(Chatbot, Flow.chatbot_id == Chatbot.id)
                .where(Flow.id == flow_id, Chatbot.user_id == user_id)
            )
            result = await session.execute(stmt)
            owned_flow = result.scalars().first()
            await session.commit()
            return owned_flow

    async def delete_flow(self, flow_id: str) -> bool:
        async with session_manager(self.session) as session:
            stmt = delete(Flow).where(Flow.id == flow_id)
            result = await session.execute(stmt)
            await session.commit()
            return result.rowcount > 0
