from shared.models.opencopilot_db import engine
from sqlalchemy.orm import sessionmaker

from shared.models.opencopilot_db.flow import Flow
from shared.models.opencopilot_db.flow_variables import FlowVariable

Session = sessionmaker(bind=engine)


def flow_to_dict(flow: Flow):
    """
    Convert a Flow object to a dictionary, including its associated variables.

    Args:
        flow: The Flow object.

    Returns:
        A dictionary representation of the Flow, including its variables.
    """
    with Session() as session:
        # Query for variables associated with the flow
        # variables = session.query(FlowVariable).filter(FlowVariable.flow_id == flow.id).all()
        # variables_dict = [flow_variable_to_dict(variable) for variable in variables]

        return {
            "flow_id": flow.id.hex() if isinstance(flow.id, bytes) else flow.id,
            "name": flow.name,
            "blocks": flow.payload,
            "description": flow.description,
            "last_saved_at": flow.updated_at.isoformat() if flow.updated_at else None,
            # "variables": variables_dict  # Including nested variables
        }


def flow_to_simplified_dict(flow: Flow):
    """Convert a Flow object to a dictionary."""
    return {
        "id": flow.id.hex() if isinstance(flow.id, bytes) else flow.id,
        "name": flow.name,
    }


def flow_variable_to_dict(variable: FlowVariable):
    """Convert a FlowVariable object to a dictionary."""
    return {
        "name": variable.name,
        "value": variable.value,
        "runtime_override_key": variable.runtime_override_key,
        "runtime_override_action_id": variable.runtime_override_action_id,
    }
