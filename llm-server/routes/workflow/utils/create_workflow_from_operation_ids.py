from typing import List

from entities.action_entity import ActionDTO
from entities.flow_entity import FlowDTO, Block
from models.repository.action_repo import find_action_by_operation_id


def create_dynamic_flow_from_operation_ids(
        operation_ids: List[str], bot_id: str
) -> FlowDTO:
    flow = FlowDTO()
    flow.name = "Dynamic Flow"
    flow.description = "Dynamic Flow"
    flow.bot_id = bot_id
    flow.variables = []
    flow.blocks = []

    for operation_id in operation_ids:
        block = Block()
        action = ActionDTO()
        operation = find_action_by_operation_id(operation_id)

        action.bot_id = bot_id
        action.name = "Dynamic action"
        action.api_endpoint = operation.api_endpoint
        action.request_type = operation.request_type
        action.description = operation.description
        action.operation_id = operation_id

        block.name = "Dynamic Block"
        block.actions.append(action)

        flow.blocks.append(block)


    return flow