from typing import Optional, Type

from opencopilot_db import engine
from opencopilot_db.block_action import BlockAction
from opencopilot_db.flow import Flow
from opencopilot_db.flow_block import FlowBlock
from opencopilot_db.flow_variables import FlowVariable
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)


def create_flow(chatbot_id: str, name: str) -> Flow:
    """Creates a new flow record.

    Args:
        chatbot_id: The ID of the chatbot associated with the flow.
        name: The name of the flow.

    Returns:
        The newly created Flow object.
    """
    with Session() as session:
        flow = Flow(chatbot_id=chatbot_id, name=name)
        session.add(flow)
        session.commit()
        return flow


def get_all_flows_by_bot_id(bot_id: str) -> list[Type[Flow]]:
    """Retrieves all flows for a given bot.

    Args:
        bot_id: The ID of the bot.

    Returns:
        A list of Flow objects.
    """
    with Session() as session:
        return session.query(Flow).filter(Flow.chatbot_id == bot_id).all()


def get_flow_by_id(flow_id: str) -> Optional[Flow]:
    """Fetches a specific flow by its ID.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flow object or None if not found.
    """
    with Session() as session:
        return session.query(Flow).filter(Flow.id == flow_id).first()


def get_flow_variables(flow_id: str) -> list[Type[FlowVariable]]:
    """Fetches variables associated with a specific flow.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A list of FlowVariable objects.
    """
    with Session() as session:
        return session.query(FlowVariable).filter(FlowVariable.flow_id == flow_id).all()


def add_variable_to_flow(flow_id: str, name: str, value: str) -> FlowVariable:
    """Adds or updates a variable in a flow.

    Args:
        flow_id: The ID of the flow.
        name: The name of the variable.
        value: The value of the variable.

    Returns:
        The newly created or updated FlowVariable object.
    """
    with Session() as session:
        variable = FlowVariable(flow_id=flow_id, name=name, value=value)
        session.add(variable)
        session.commit()
        return variable


def flow_to_dict_with_nested_entities(flow: Flow):
    """Convert a Flow object and its related entities to a dictionary."""
    with Session() as session:
        # Convert FlowBlocks associated with the Flow
        flow_blocks = session.query(FlowBlock).filter(FlowBlock.flow_id == flow.id).all()
        blocks_dict = [flow_block_to_dict(block) for block in flow_blocks]

        # For each block, include its associated BlockActions
        for block in blocks_dict:
            block_actions = session.query(BlockAction).filter(BlockAction.flow_block_id == block.id).all()
            block['actions'] = [block_action_to_dict(action) for action in block_actions]

        # Convert FlowVariables associated with the Flow
        flow_variables = session.query(FlowVariable).filter(FlowVariable.flow_id == flow.id).all()
        variables_dict = [flow_variable_to_dict(variable) for variable in flow_variables]

        return {
            "id": flow.id.hex() if isinstance(flow.id, bytes) else flow.id,
            "name": flow.name,
            "chatbot_id": flow.chatbot_id,
            "status": flow.status,
            "blocks": blocks_dict,
            "variables": variables_dict,
            "created_at": flow.created_at.isoformat() if flow.created_at else None,
            "updated_at": flow.updated_at.isoformat() if flow.updated_at else None,
            "deleted_at": flow.deleted_at.isoformat() if flow.deleted_at else None,
        }


def flow_to_dict(flow: Flow):
    """Convert a Flow object to a dictionary."""
    return {
        "id": flow.id.hex() if isinstance(flow.id, bytes) else flow.id,
        "name": flow.name,
        "chatbot_id": flow.chatbot_id,
        "status": flow.status,
        "created_at": flow.created_at.isoformat() if flow.created_at else None,
        "updated_at": flow.updated_at.isoformat() if flow.updated_at else None,
        "deleted_at": flow.deleted_at.isoformat() if flow.deleted_at else None,
    }


def flow_block_to_dict(block: FlowBlock):
    """Convert a FlowBlock object to a dictionary."""
    return {
        "id": block.id.hex() if isinstance(block.id, bytes) else block.id,
        "name": block.name,
        "chatbot_id": block.chatbot_id,
        "flow_id": block.flow_id,
        "status": block.status,
        "next_on_success": block.next_on_success,
        "next_on_fail": block.next_on_fail,
        "order": block.order_within_the_flow,
        "created_at": block.created_at.isoformat() if block.created_at else None,
        "updated_at": block.updated_at.isoformat() if block.updated_at else None,
        "deleted_at": block.deleted_at.isoformat() if block.deleted_at else None,
    }


def block_action_to_dict(action: BlockAction):
    """Convert a BlockAction object to a dictionary."""
    return {
        "id": action.id.hex() if isinstance(action.id, bytes) else action.id,
        "name": action.name,
        "chatbot_id": action.chatbot_id,
        "flow_id": action.flow_id,
        "type": action.type,
        "swagger_endpoint": action.swagger_endpoint,
        "order": action.order,
        "created_at": action.created_at.isoformat() if action.created_at else None,
        "updated_at": action.updated_at.isoformat() if action.updated_at else None,
        "deleted_at": action.deleted_at.isoformat() if action.deleted_at else None,
    }


def flow_variable_to_dict(variable: FlowVariable):
    """Convert a FlowVariable object to a dictionary."""
    return {
        "id": variable.id.hex() if isinstance(variable.id, bytes) else variable.id,
        "flow_id": variable.flow_id,
        "chatbot_id": variable.chatbot_id,
        "name": variable.name,
        "value": variable.value,
        "runtime_override_key": variable.runtime_override_key,
        "runtime_override_action_id": variable.runtime_override_action_id,
        "status": variable.status,
        "created_at": variable.created_at.isoformat() if variable.created_at else None,
        "updated_at": variable.updated_at.isoformat() if variable.updated_at else None,
        "deleted_at": variable.deleted_at.isoformat() if variable.deleted_at else None,
    }
