from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from shared.models.opencopilot_db.powerups import PowerUp
from models.repository.powerup_repo import (
    create_powerup,
    get_all_powerups,
    get_regex_for_dynamic_params,
    update_powerup,
    delete_powerup,
)
from utils.get_chat_model import get_chat_model
from langchain.schema import HumanMessage, SystemMessage

powerup_router = APIRouter()


class PowerUpData(BaseModel):
    path: Optional[str]
    user_input: Optional[str]
    instruction: Optional[str]
    input_data: Optional[str]
    context: Optional[str]


@powerup_router.post("/")
def create_powerup_endpoint(powerup_data: PowerUpData):
    if powerup_data.path is not None:
        powerup_data.path = get_regex_for_dynamic_params(powerup_data.path)
    powerup = create_powerup(powerup_data.dict())
    return {"powerup": powerup.status_code == 201}


@powerup_router.get("/")
def get_all_powerups_endpoint(path: Optional[str] = None):
    if path is not None:
        path = get_regex_for_dynamic_params(path)
    powerups = get_all_powerups(path)
    return {"powerups": powerups}


@powerup_router.put("/{powerup_id}")
def update_powerup_endpoint(powerup_id: int, powerup_data: PowerUpData):
    powerup = update_powerup(powerup_id, powerup_data.dict())
    if powerup:
        return {"powerup": powerup}
    else:
        raise HTTPException(status_code=404, detail="PowerUp not found")


@powerup_router.delete("/{powerup_id}")
def delete_powerup_endpoint(powerup_id: int):
    success = delete_powerup(powerup_id)
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
