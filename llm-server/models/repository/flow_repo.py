from flask import jsonify, Response
from opencopilot_db import engine
from opencopilot_db.flow import Flow
from opencopilot_db.flow_variables import FlowVariable
from sqlalchemy.orm import sessionmaker

from presenters.flow_presenters import flow_to_dict, flow_to_dict_with_nested_entities, flow_variable_to_dict

Session = sessionmaker(bind=engine)


def create_flow(chatbot_id: str, name: str):
    """
    API method to create a new flow record and return it in a JSON format.

    Args:
        chatbot_id: The ID of the chatbot associated with the flow.
        name: The name of the flow.

    Returns:
        A Flask response object with the newly created Flow object as a dictionary.
    """
    try:
        with Session() as session:
            flow = Flow(chatbot_id=chatbot_id, name=name)
            session.add(flow)
            session.commit()
            return jsonify({"status": "success", "data": flow_to_dict(flow)}), 201
    except Exception as e:
        # Log the exception here
        print(f"Error creating flow: {e}")
        # Return an error response
        return jsonify({"error": "Failed to create flow"}), 500


def get_all_flows_by_bot_id(bot_id: str):
    """
    API method to retrieve all flows for a given bot and convert them to a dictionary format.

    Args:
        bot_id: The ID of the bot.

    Returns:
        A Flask response object with a list of dictionaries representing Flow objects.
    """
    try:
        with Session() as session:
            flows = session.query(Flow).filter(Flow.chatbot_id == bot_id).all()
            flows_dict = [flow_to_dict(flow) for flow in flows]
            return jsonify(flows_dict), 200
    except Exception as e:
        # Log the exception
        print(f"Error retrieving flows: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flows"}), 500


def get_flow_by_id(flow_id: str):
    """
    API method to fetch a specific flow by its ID and convert it to a dictionary format.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with a dictionary representing the Flow object.
    """
    try:
        with Session() as session:
            flow = session.query(Flow).filter(Flow.id == flow_id).first()
            if flow:
                flow_dict = flow_to_dict_with_nested_entities(flow)
                return jsonify(flow_dict), 200
            else:
                return jsonify({"status": "error", "message": "Flow not found"}), 404
    except Exception as e:
        # Log the exception
        print(f"Error retrieving flow by ID: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow"}), 500


def get_flow_variables(flow_id: str):
    """
    API method to fetch variables associated with a specific flow and convert them to a dictionary format.

    Args:
        flow_id: The ID of the flow.

    Returns:
        A Flask response object with a list of dictionaries representing FlowVariable objects.
    """
    try:
        with Session() as session:
            flow_variables = session.query(FlowVariable).filter(FlowVariable.flow_id == flow_id).all()
            variables_dict = [flow_variable_to_dict(variable) for variable in flow_variables]
            return jsonify(variables_dict), 200
    except Exception as e:
        # Log the exception here
        print(f"Error retrieving flow variables: {e}")
        # Return an error response
        return jsonify({"error": "Failed to retrieve flow variables"}), 500


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
