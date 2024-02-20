from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from shared.models.opencopilot_db.powerups import PowerUp
from fastapi import Depends
from models.repository.powerup_repo import PowerUpRepository
from utils.get_chat_model import get_chat_model
from langchain.schema import HumanMessage, SystemMessage
from models.di import get_powerup_repository

powerup_router = APIRouter()


class PowerUpData(BaseModel):
    path: Optional[str]
    user_input: Optional[str]
    instruction: Optional[str]
    input_data: Optional[str]
    context: Optional[str]


@powerup_router.post("/")
async def create_powerup_endpoint(
    powerup_data: PowerUpData,
    powerup_repo: PowerUpRepository = Depends(get_powerup_repository),
):
    if powerup_data.path is not None:
        powerup_data.path = await powerup_repo.get_regex_for_dynamic_params(
            powerup_data.path
        )
    powerup = await powerup_repo.create_powerup(powerup_data.dict())
    return {"powerup": powerup.status_code == 201}


@powerup_router.get("/")
async def get_all_powerups_endpoint(
    path: Optional[str] = None,
    powerup_repo: PowerUpRepository = Depends(get_powerup_repository),
):
    if path is not None:
        path = await powerup_repo.get_regex_for_dynamic_params(path)
    powerups = await powerup_repo.get_all_powerups(path)
    return {"powerups": powerups}


@powerup_router.put("/{powerup_id}")
async def update_powerup_endpoint(
    powerup_id: int,
    powerup_data: PowerUpData,
    powerup_repo: PowerUpRepository = Depends(get_powerup_repository),
):
    powerup = await powerup_repo.update_powerup(powerup_id, powerup_data.dict())
    if powerup:
        return {"powerup": powerup}
    else:
        raise HTTPException(status_code=404, detail="PowerUp not found")


@powerup_router.delete("/{powerup_id}")
async def delete_powerup_endpoint(
    powerup_id: int,
    powerup_repo: PowerUpRepository = Depends(get_powerup_repository),
):
    success = await powerup_repo.delete_powerup(powerup_id)
    if success:
        return {"message": "PowerUp deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="PowerUp not found")


@powerup_router.post("/{powerup_id}")
def powerup_typing(powerup_id: int, user_input: str):
    if not user_input:
        raise HTTPException(status_code=400, detail="User input is required")

    powerup = PowerUp.query.get(powerup_id)
    if not powerup:
        raise HTTPException(status_code=404, detail="PowerUp not found")

    chat_model = get_chat_model()
    messages = [
        SystemMessage(content=powerup.base_prompt),
        HumanMessage(content=user_input),
    ]
    content = chat_model(messages).content
    return {"response": content}


@powerup_router.post("/i/instruct")
def powerup_instruct(instruction: str, input_data: str, context: Optional[str] = None):
    if not instruction or not input_data:
        raise HTTPException(
            status_code=400, detail="Instruction and input data are required"
        )

    chat_model = get_chat_model()
    system_message = SystemMessage(
        content="You are an ai assistant that helps people with their writing."
    )
    instruction_message = HumanMessage(content=instruction)
    input_data_message = HumanMessage(content=input_data)
    messages = [system_message, instruction_message]
    if context is not None:
        context_message = HumanMessage(
            content=f"<!-- Additional Context: {context} -->"
        )
        messages.append(context_message)
    messages.append(input_data_message)

    content = chat_model(messages).content
    return {"response": content}
