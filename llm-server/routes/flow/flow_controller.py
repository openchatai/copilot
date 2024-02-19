import uuid

from fastapi import APIRouter, Body, Response, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
from entities.flow_entity import FlowDTO
from models.repository.copilot_repo import find_one_or_fail_by_id
from models.repository.flow_repo import (
    create_flow,
    get_all_flows_for_bot,
    get_flow_by_id,
    get_variables_for_flow,
    add_or_update_variable_in_flow,
    update_flow,
    delete_flow as delete_flow_from_db,
)
from presenters.flow_presenters import flow_to_dict, flow_variable_to_dict
from routes.flow import flow_vector_service
from routes.flow.utils.dynamic_flow_builder import build_dynamic_flow
from utils.get_logger import CustomLogger
from routes.flow.flow_vector_service import delete_flow as delete_flow_from_vector_store

logger = CustomLogger("flow")
flow_router = APIRouter()


class Data(BaseModel):
    text: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    variables: Optional[List[Any]] = None
    blocks: Optional[List[Any]] = None
    status: Optional[str] = None
    value: Optional[Any] = None
    runtime_override_key: Optional[str] = None
    runtime_override_action_id: Optional[str] = None
    chatbot_id: Optional[str] = None


@flow_router.post("/dynamic/bot/{bot_id}")
async def build_flow_from_text(data: Data, bot_id: str):
    response = await build_dynamic_flow(data.text, bot_id)
    return response


@flow_router.get("/bot/{bot_id}")
async def get_all_flows_api(bot_id: str):
    """
    API endpoint to retrieve all flows for a given bot.

    Args:
        bot_id: The ID of the bot.

    Returns:
        A Flask response object with a list of Flow objects as dictionaries.
    """
    try:
        flows = await get_all_flows_for_bot(bot_id)
        flows_dict = [flow_to_dict(flow) for flow in flows]
        return flows_dict, 200
    except Exception as e:
        print(f"Error retrieving flows for bot ID {bot_id}: {e}")
        raise HTTPException(
            status_code=500, detail={"error": "Failed to retrieve flows"}
        )


@flow_router.post("/bot/{bot_id}")
async def create_flow_api(data: Data, bot_id: str):
    try:
        if not data:
            raise HTTPException(status_code=400, detail={"error": "No data provided"})

        for block in data.blocks or []:
            for action in block.get("actions", []):
                action["bot_id"] = bot_id

        try:
            flow_dto = FlowDTO(
                bot_id=bot_id,
                name=data.name,
                description=data.description,
                variables=data.variables or [],
                blocks=data.blocks or [],
                id=str(uuid.uuid4()),
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail={"error": str(e)})

        flow = await create_flow(flow_dto)
        flow_vector_service.create_flow(flow_dto)
        return flow_to_dict(flow), 201

    except Exception as e:
        print(f"Error creating flow: {e}")
        logger.error("Failed to create flow", payload=e)
        raise HTTPException(
            status_code=500, detail={"error": f"Failed to create flow. {e}"}
        )


@flow_router.put("/{flow_id}")
async def update_flow_api(data: Data, flow_id: str):
    try:
        if not data:
            raise HTTPException(status_code=400, detail={"error": "No data provided"})

        flow = await get_flow_by_id(flow_id)
        for block in data.blocks or []:
            for action in block.get("actions", []):
                action["bot_id"] = flow.chatbot_id

        try:
            flow_dto = FlowDTO(
                id=flow_id,  # Convert string to UUID
                bot_id=flow.chatbot_id,
                name=data.name,
                status=data.status,
                variables=data.variables or [],
                blocks=data.blocks or [],
                description=data.description,
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail={"error": str(e)})

        updated_flow = update_flow(flow_id, flow_dto)
        if updated_flow:
            return flow_to_dict(updated_flow), 200
        else:
            raise HTTPException(status_code=404, detail={"error": "Flow not found"})
    except Exception as e:
        print(f"Error updating flow: {e}")
        raise HTTPException(
            status_code=500, detail={"error": f"Failed to update flow. {e}"}
        )


@flow_router.get("/{flow_id}")
async def get_flow_by_id_api(flow_id: str):
    try:
        flow = await get_flow_by_id(flow_id)
        if flow:
            return flow_to_dict(flow), 200
        else:
            raise HTTPException(status_code=404, detail={"error": "Flow not found"})
    except Exception as e:
        print(f"Error retrieving flow with ID {flow_id}: {e}")
        raise HTTPException(
            status_code=500, detail={"error": f"Failed to retrieve flow {e}"}
        )


@flow_router.get("/{flow_id}/variables")
async def get_flow_variables_api(flow_id: str):
    try:
        flow_variables = await get_variables_for_flow(flow_id)
        variables_dict = [
            flow_variable_to_dict(variable) for variable in flow_variables
        ]
        return variables_dict, 200
    except Exception as e:
        print(f"Error retrieving flow variables for flow ID {flow_id}: {e}")
        raise HTTPException(
            status_code=500, detail={"error": f"Failed to retrieve flow variables {e}"}
        )


@flow_router.post("/{flow_id}/variables")
@flow_router.put("/{flow_id}/variables")
async def add_variables_to_flow_api(data: Data, flow_id: str):
    try:
        copilot_id = data.chatbot_id
        bot = find_one_or_fail_by_id(copilot_id)

        if not data.name or data.value is None:
            raise HTTPException(
                status_code=400, detail={"error": "Missing required fields"}
            )

        variable = add_or_update_variable_in_flow(
            bot.id,
            flow_id,
            data.name,
            data.value,
            data.runtime_override_key,
            data.runtime_override_action_id,
        )
        return {"status": "success", "data": flow_variable_to_dict(variable)}, 201
    except Exception as e:
        print(f"Error adding/updating variable in flow: {e}")
        raise HTTPException(
            status_code=500,
            detail={"error": f"Failed to add/update variable in flow {e}"},
        )


@flow_router.delete("/{flow_id}")
def delete_flow_api(flow_id: str):
    try:
        if delete_flow_from_db(flow_id):
            point_id = flow_vector_service.get_flow_point_id_by_flow_id(flow_id)
            if point_id:
                delete_flow_from_vector_store(point_id)
                return {"success": True, "message": "Flow deleted successfully."}, 200
            else:
                raise HTTPException(
                    status_code=404,
                    detail={"success": False, "message": "Flow vector not found."},
                )
        else:
            raise HTTPException(
                status_code=404,
                detail={"success": False, "message": "Flow not found in database."},
            )
    except Exception as e:
        logger.error("Failed to delete flow", payload=e)
        raise HTTPException(status_code=500, detail={"error": "Failed to delete flow."})
