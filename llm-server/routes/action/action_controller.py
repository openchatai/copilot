from fastapi import FastAPI, File, UploadFile, HTTPException
from werkzeug.utils import secure_filename
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND, HTTP_400_BAD_REQUEST

from entities.action_entity import ActionDTO
from models.repository.action_repo import (
    list_all_actions,
    action_to_dict,
    create_actions,
    create_action,
    find_action_by_id,
    update_action,
    delete_action_by_id,
)
from routes.action import action_vector_service
from utils.get_logger import CustomLogger
from utils.swagger_parser import SwaggerParser

from fastapi import APIRouter

action_router = APIRouter()

logger = CustomLogger("action")


@action_router.get("/bot/{chatbot_id}")
async def get_actions(chatbot_id: str):
    actions = list_all_actions(chatbot_id)
    return [action_to_dict(action) for action in actions]


@action_router.put("/bot/{chatbot_id}/import-from-swagger")
async def import_actions_from_swagger_file(
    chatbot_id: str, file: UploadFile = File(None)
):
    if not file:
        raise HTTPException(
            HTTP_400_BAD_REQUEST, {"error": "No file part in the request"}
        )

    filename = secure_filename(file.filename)
    swagger_content = await file.read()

    try:
        swagger_parser = SwaggerParser(swagger_content)
        swagger_parser.ingest_swagger_summary(chatbot_id)
        actions = swagger_parser.get_all_actions(chatbot_id)
    except Exception as e:
        logger.error("Failed to parse Swagger file", error=e, bot_id=chatbot_id)
        raise HTTPException(
            HTTP_400_BAD_REQUEST,
            {
                "message": f"Failed to parse Swagger file: {str(e)}",
                "is_error": True,
            },
        )

    is_error = False

    try:
        create_actions(chatbot_id, actions)
        action_vector_service.create_actions(actions)
    except Exception as e:
        logger.error(
            str(e),
            message="Something failed while parsing swagger file",
            bot_id=chatbot_id,
        )

    return {
        "message": f"Successfully imported actions from {filename}",
        "is_error": is_error,
    }, HTTP_201_CREATED


@action_router.post("/bot/{chatbot_id}")
async def add_action(chatbot_id: str, action_dto: ActionDTO):
    saved_action = create_action(chatbot_id, action_dto.dict())
    action_vector_service.create_action(action_dto.dict())
    return action_to_dict(saved_action), HTTP_201_CREATED


@action_router.patch("/bot/{chatbot_id}/action/{action_id}")
async def update_single_action(chatbot_id: str, action_id: str, action_dto: ActionDTO):
    saved_action = update_action(action_id, action_dto.dict())
    action_vector_service.update_action_by_operation_id(action_dto.dict())
    return saved_action, HTTP_201_CREATED


@action_router.get("/{action_id}")
async def get_action(action_id: str):
    action = find_action_by_id(action_id)
    if action is None:
        raise HTTPException(HTTP_404_NOT_FOUND, {"error": "Action not found"})
    return action_to_dict(action)


@action_router.delete("/{action_id}")
async def delete_action(action_id: str):
    action = find_action_by_id(action_id)
    if action is None:
        raise HTTPException(HTTP_404_NOT_FOUND, {"error": "Action not found"})

    action_vector_service.delete_action_by_operation_id(
        bot_id=str(action.bot_id), operation_id=str(action.operation_id)
    )
    delete_action_by_id(
        operation_id=str(action.operation_id), bot_id=str(action.bot_id)
    )
    return {"message": "Action deleted successfully"}, HTTP_201_CREATED
