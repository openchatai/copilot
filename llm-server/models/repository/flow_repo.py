from typing import List, Optional, Type

from opencopilot_db import engine
from opencopilot_db.flow import Flow
from opencopilot_db.flow_variables import FlowVariable
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)


def create_flow(chatbot_id: str, name: str) -> Flow:
    """
    Creates a new flow record in the database.

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


def get_all_flows_for_bot(bot_id: str) -> List[Flow]:
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
        return session.query(Flow).filter(Flow.id == flow_id).first()


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


def add_or_update_variable_in_flow(flow_id: str, name: str, value: str) -> FlowVariable:
    """
    Adds a new variable to a flow or updates it if it already exists.

    Args:
        flow_id: The ID of the flow.
        name: The name of the variable.
        value: The value of the variable.

    Returns:
        The updated or newly created FlowVariable object.
    """
    with Session() as session:
        variable = session.query(FlowVariable).filter_by(flow_id=flow_id, name=name).first()
        if variable:
            variable.value = value
        else:
            variable = FlowVariable(flow_id=flow_id, name=name, value=value)
            session.add(variable)
        session.commit()
        return variable
