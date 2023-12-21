from typing import List

from entities.action_entity import ActionDTO
from entities.flow_entity import FlowDTO, Block
from models.repository.action_repo import find_action_by_method_id_and_bot_id


def create_flow_from_operation_ids(
        operation_ids: List[str], bot_id: str
) -> FlowDTO:
    flow = FlowDTO(blocks=[], bot_id=bot_id, description="", id="", name="", variables=[])
    flow.name = "Dynamic Flow"
    flow.description = "Dynamic Flow"
    flow.bot_id = bot_id
    flow.variables = []
    flow.blocks = []

    for operation_id in operation_ids:
        block = Block(actions=[], name="", next_on_fail=None, next_on_success=None, order=0)
        operation = find_action_by_method_id_and_bot_id(operation_id=operation_id, bot_id=bot_id)
        action = ActionDTO(bot_id=bot_id, name=operation.name, api_endpoint=operation.api_endpoint,
                           description=operation.description, request_type=operation.request_type,
                           operation_id=operation_id, payload=operation.payload)

        block.name = "Dynamic Block"
        block.actions.append(action)

        flow.blocks.append(block)

    return flow
