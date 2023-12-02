from typing import List, Optional, Type

from opencopilot_db import engine
from opencopilot_db.flow import Flow
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
