from opencopilot_db import engine
from opencopilot_db.flow import Flow
from opencopilot_db.flow_variables import FlowVariable
from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=engine)


def flow_to_dict(flow: Flow):
    """Convert a Flow object to a dictionary."""
    return {
        "flow_id": flow.id.hex() if isinstance(flow.id, bytes) else flow.id,
        "name": flow.name,
        "payload": flow.payload,
        "description": flow.description,
        "last_saved_at": flow.updated_at.isoformat() if flow.updated_at else None,
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
