import json
from typing import Optional, Type, Any

from shared.models.opencopilot_db import engine
from sqlalchemy.orm import sessionmaker

from entities.flow_entity import FlowDTO
from shared.models.opencopilot_db.flow import Flow
from shared.models.opencopilot_db.flow_variables import FlowVariable

Session = sessionmaker(bind=engine)


def create_flow(flow_dto: FlowDTO) -> Flow:
    """
    Creates a new flow record in the database.

    Args:
        flow_dto: An instance of FlowDTO containing all necessary data.

    Returns:
        The newly created Flow object.
    """
    blocks_json = [block.model_dump() for block in flow_dto.blocks]

    with Session() as session:
        # Create a new Flow instance using data from the DTO
        new_flow = Flow(
            chatbot_id=flow_dto.bot_id,
            name=flow_dto.name,
            payload=blocks_json,
            description=flow_dto.description,
            operation_id=flow_dto.operation_id,
            id=flow_dto.id,
        )

        session.add(new_flow)
        session.commit()
        session.refresh(
            new_flow
        )  # Refresh the instance to load any unloaded attributes
        return new_flow


def update_flow(flow_id: str, flow_dto: FlowDTO) -> Type[Flow]:
    """
    Updates an existing flow record in the database.

    Args:
        flow_dto:
        flow_id: The ID of the flow to update.

    Returns:
        The updated Flow object, or None if not found.
    """
    blocks_json = [block.model_dump() for block in flow_dto.blocks]

    with Session() as session:
        flow = session.query(Flow).filter(Flow.id == flow_id).first()
        if flow:
            flow.name = flow_dto.name
            flow.payload = blocks_json
            flow.description = flow_dto.description
            session.commit()
            session.refresh(flow)
            return flow
        return None


def get_all_flows_for_bot(bot_id: str) -> list[Type[Flow]]:
    """
    Retrieves all flows for a given bot from the database.

    Args:
        bot_id: The ID of the bot.

    Returns:
        A list of Flow objects.
    """
    with Session() as session:
        flows = session.query(Flow).filter(Flow.chatbot_id == bot_id).all()
        return flows


def get_flow_by_id(flow_id: str) -> Optional[Flow]:
    """
    Retrieves a specific flow by its ID from the database.

    Args:
        flow_id: The ID of the flow.

    Returns:
        The Flow object if found, otherwise None.
    """
    with Session() as session:
        return session.query(Flow).filter(Flow.id == str(flow_id)).first()


def get_variables_for_flow(flow_id: str) -> list[Type[FlowVariable]]:
    """
    Retrieves all variables for a specific flow from the database.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A list of FlowVariable objects.
    """
    with Session() as session:
        return session.query(FlowVariable).filter(FlowVariable.flow_id == flow_id).all()


def add_or_update_variable_in_flow(
    bot_id: str,
    flow_id: str,
    name: str,
    value: str,
    runtime_override_key: str = None,
    runtime_override_action_id: str = None,
) -> FlowVariable:
    """
    Adds a new variable to a flow or updates it if it already exists.

    Args:
        bot_id:
        runtime_override_key:
        runtime_override_action_id:
        flow_id: The ID of the flow.
        name: The name of the variable.
        value: The value of the variable.

    Returns:
        The updated or newly created FlowVariable object.
    """
    with Session() as session:
        variable = (
            session.query(FlowVariable)
            .filter_by(
                bot_id=bot_id,
                flow_id=flow_id,
                name=name,
                runtime_override_action_id=runtime_override_action_id,
                runtime_override_key=runtime_override_key,
            )
            .first()
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
        session.commit()
        return variable


def delete_flow(flow_id: str) -> bool:
    """
    Deletes a flow record from the database.
    Args:
        flow_id: The ID of the flow to delete.
    Returns:
        True if the flow was deleted, False otherwise.
    """
    with Session() as session:
        flow = session.query(Flow).filter(Flow.id == flow_id).first()
        if flow:
            session.delete(flow)
            session.commit()
            return True
        return False
