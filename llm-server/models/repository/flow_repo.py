from typing import Type
from sqlalchemy import select
from shared.models.opencopilot_db import async_engine
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlalchemy import and_
from entities.flow_entity import FlowDTO
from shared.models.opencopilot_db.flow import Flow
from shared.models.opencopilot_db.flow_variables import FlowVariable

async_session = async_sessionmaker(async_engine, expire_on_commit=False)


async def create_flow(flow_dto: FlowDTO) -> Flow:
    blocks_json = [block.model_dump() for block in flow_dto.blocks]
    async with async_session() as session:
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


async def update_flow(flow_id: str, flow_dto: FlowDTO) -> Type[Flow]:
    blocks_json = [block.model_dump() for block in flow_dto.blocks]
    async with async_session() as session:
        flow = (await session.scalars(select(Flow).where(Flow.id == flow_id))).first()
        if not flow:
            raise Exception("Flow not found")

        flow.name = flow_dto.name
        flow.payload = blocks_json
        flow.description = flow_dto.description
        await session.commit()
        await session.refresh(flow)
        return flow


async def get_all_flows_for_bot(bot_id: str):
    async with async_session() as session:
        flows = (
            await session.scalars(select(Flow).where(Flow.chatbot_id == bot_id))
        ).all()

        return flows


async def get_flow_by_id(flow_id: str):
    async with async_session() as session:
        return (
            await session.scalars(select(Flow).where(Flow.id == str(flow_id)))
        ).first()


async def get_variables_for_flow(flow_id: str):
    async with async_session() as session:
        return (
            await session.scalars(
                select(FlowVariable).where(FlowVariable.flow_id == flow_id)
            )
        ).all()


async def add_or_update_variable_in_flow(
    bot_id: str,
    flow_id: str,
    name: str,
    value: str,
    runtime_override_key: str = None,
    runtime_override_action_id: str = None,
) -> FlowVariable:
    async with async_session() as session:
        variable = await session.scalar(
            select(FlowVariable).where(
                and_(
                    FlowVariable.bot_id == bot_id,
                    FlowVariable.flow_id == flow_id,
                    FlowVariable.name == name,
                    FlowVariable.runtime_override_action_id
                    == runtime_override_action_id,
                    FlowVariable.runtime_override_key == runtime_override_key,
                )
            )
        )
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


async def delete_flow(flow_id: str) -> bool:
    async with async_session() as session:
        flow = (await session.scalars(select(Flow).where(Flow.id == flow_id))).first()
        if flow:
            await session.delete(flow)
            await session.commit()
            return True
        return False
