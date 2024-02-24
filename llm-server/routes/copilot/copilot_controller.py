import os
from typing import Optional
from fastapi import APIRouter, Depends, Form, HTTPException, Body, Header
from enums.initial_prompt import ChatBotInitialPromptEnum
from models.repository.copilot_repo import CopilotRepository
from models.di import get_copilot_repository, get_powerup_repository
from models.repository.powerup_repo import PowerUpRepository
from routes._swagger.reindex_service import migrate_actions
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)
copilot_router = APIRouter()


@copilot_router.get("/")
async def index(
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    chatbots = await copilot_repo.list_all_with_filter()
    return [chatbot for chatbot in chatbots]


@copilot_router.post("/")
async def create_new_copilot(
    name: Optional[str] = Form("My First Copilot"),
    prompt_message: Optional[str] = Form(
        ChatBotInitialPromptEnum.AI_COPILOT_INITIAL_PROMPT
    ),
    website: Optional[str] = Form("https://example.com"),
    powerup_repo: PowerUpRepository = Depends(get_powerup_repository),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    chatbot = await copilot_repo.create_copilot(
        name=name,
        swagger_url="remove.this.filed.after.migration",
        prompt_message=prompt_message,
        website=website,
    )

    powerup_apps = [
        {
            "chatbot_id": chatbot.id,
            "base_prompt": "You are an AI assistant that excels at correcting grammar mistakes. Please improve the following text while maintaining the original meaning:",
            "name": "Text Corrector",
            "description": "Corrects grammar mistakes in a given text while maintaining the original meaning.",
        },
        {
            "chatbot_id": chatbot.id,
            "base_prompt": "You are an AI that predicts the next word in a sequence of text. Given the text below, predict the most likely next word:",
            "name": "Next Word Predictor",
            "description": "Predicts the next word in a sequence of text.",
        },
        {
            "chatbot_id": chatbot.id,
            "base_prompt": "You are an AI that rephrases sentences to enhance clarity and style. Please rephrase the following sentence:",
            "name": "Sentence Rephraser",
            "description": "Rephrases sentences to enhance clarity and style.",
        },
    ]

    await powerup_repo.create_powerups_bulk(powerup_apps)
    return chatbot.to_dict()


@copilot_router.get("/{copilot_id}")
async def get_copilot(
    copilot_id, copilot_repo: CopilotRepository = Depends(get_copilot_repository)
):
    try:
        bot = await copilot_repo.find_one_or_fail_by_id(copilot_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="chatbot_not_found")

    return {"chatbot": bot}


@copilot_router.delete("/{copilot_id}")
async def delete_bot(
    copilot_id, copilot_repo: CopilotRepository = Depends(get_copilot_repository)
):
    try:
        await copilot_repo.find_or_fail_by_bot_id(copilot_id)
        return {"success": "chatbot_deleted"}
    except ValueError:
        raise HTTPException(status_code=404, detail="chatbot_not_found")


@copilot_router.post("/{copilot_id}")
@copilot_router.put("/{copilot_id}")
@copilot_router.patch("/{copilot_id}")
async def general_settings_update(
    copilot_id,
    data: dict = Body(...),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    await copilot_repo.find_one_or_fail_by_id(copilot_id)
    logger.info(
        "Updating Copilot",
        incident="update_copilot",
        data=data,
        bot_id=copilot_id,
    )
    updated_copilot = await copilot_repo.update_copilot(
        copilot_id=copilot_id,
        name=data.get("name"),
        prompt_message=data.get("prompt_message"),
        swagger_url=data.get("swagger_url"),
        enhanced_privacy=data.get("enhanced_privacy"),
        smart_sync=data.get("smart_sync"),
        website=data.get("website"),
    )
    return {"chatbot": updated_copilot}


@copilot_router.post("/{copilot_id}/variables")
@copilot_router.put("/{copilot_id}/variables")
@copilot_router.patch("/{copilot_id}/variables")
async def update_global_variables(
    copilot_id: str,
    new_variables: dict = Body(...),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):

    await copilot_repo.find_one_or_fail_by_id(copilot_id)
    await copilot_repo.store_copilot_global_variables(
        copilot_id=copilot_id, new_variables=new_variables
    )
    return {"message": "JSON data stored successfully"}


@copilot_router.delete("/{copilot_id}/variable/{variable_key}")
async def delete_global_variable(
    copilot_id: str,
    variable_key: str,
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    return await copilot_repo.delete_copilot_global_key(
        copilot_id=copilot_id, variable_key=variable_key
    )


@copilot_router.get("/{copilot_id}/variables")
async def get_global_variables(
    copilot_id,
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    try:
        chatbot = await copilot_repo.find_one_or_fail_by_id(copilot_id)
        return chatbot.global_variables, 200
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail={"error": "An error occurred", "details": str(e)}
        )


def get_token(authorization: str = Header(None)):
    if authorization:
        token = authorization.split(" ")[1]
        if token == os.getenv("BASIC_AUTH_KEY"):
            return token
    raise HTTPException(status_code=511, detail="Authorization Failed!")


@copilot_router.post("/migrate/actions")
def migrate(token: str = Depends(get_token)):
    migrate_actions()
    return {"message": "job started"}
