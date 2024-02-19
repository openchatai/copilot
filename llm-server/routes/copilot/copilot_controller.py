import os
from typing import Optional
from fastapi import APIRouter, FastAPI, HTTPException, Body
from sqlalchemy.exc import SQLAlchemyError

from enums.initial_prompt import ChatBotInitialPromptEnum
from models.repository.copilot_repo import (
    delete_copilot_global_key,
    list_all_with_filter,
    find_or_fail_by_bot_id,
    find_one_or_fail_by_id,
    create_copilot,
    chatbot_to_dict,
    SessionLocal,
    update_copilot,
    store_copilot_global_variables,
)
from models.repository.powerup_repo import create_powerups_bulk
from routes._swagger.reindex_service import migrate_actions
from utils.get_logger import CustomLogger

logger = CustomLogger(module_name=__name__)
copilot_router = APIRouter()

UPLOAD_FOLDER = "shared_data"


@copilot_router.get("/")
def index():
    chatbots = list_all_with_filter()
    return [chatbot_to_dict(chatbot) for chatbot in chatbots]


@copilot_router.post("/")
def create_new_copilot(
    name: Optional[str] = Body("My First Copilot"),
    prompt_message: Optional[str] = Body(
        ChatBotInitialPromptEnum.AI_COPILOT_INITIAL_PROMPT
    ),
    website: Optional[str] = Body("https://example.com"),
):
    chatbot = create_copilot(
        name=name,
        swagger_url="remove.this.filed.after.migration",
        prompt_message=prompt_message,
        website=website,
    )

    powerup_apps = [
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI assistant that excels at correcting grammar mistakes. Please improve the following text while maintaining the original meaning:",
            "name": "Text Corrector",
            "description": "Corrects grammar mistakes in a given text while maintaining the original meaning.",
        },
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI that predicts the next word in a sequence of text. Given the text below, predict the most likely next word:",
            "name": "Next Word Predictor",
            "description": "Predicts the next word in a sequence of text.",
        },
        {
            "chatbot_id": chatbot.get("id"),
            "base_prompt": "You are an AI that rephrases sentences to enhance clarity and style. Please rephrase the following sentence:",
            "name": "Sentence Rephraser",
            "description": "Rephrases sentences to enhance clarity and style.",
        },
    ]

    create_powerups_bulk(powerup_apps)
    return chatbot


@copilot_router.get("/{copilot_id}")
def get_copilot(copilot_id):
    try:
        bot = find_one_or_fail_by_id(copilot_id)
    except ValueError:
        raise HTTPException(status_code=404, detail="chatbot_not_found")
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=500, detail={"error": "Database error", "details": str(e)}
        )

    return {"chatbot": chatbot_to_dict(bot)}


@copilot_router.delete("/{copilot_id}")
def delete_bot(copilot_id):
    session = SessionLocal()
    try:
        bot = find_or_fail_by_bot_id(copilot_id)
        session.delete(bot)
        session.commit()
        return {"success": "chatbot_deleted"}
    except ValueError:
        raise HTTPException(status_code=404, detail="chatbot_not_found")
    except SQLAlchemyError as e:
        session.rollback()
        raise HTTPException(
            status_code=500, detail={"error": "Database error", "details": str(e)}
        )
    finally:
        session.close()


@copilot_router.post("/{copilot_id}")
@copilot_router.put("/{copilot_id}")
@copilot_router.patch("/{copilot_id}")
def general_settings_update(copilot_id, data: dict = Body(...)):
    try:
        find_one_or_fail_by_id(copilot_id)
        logger.info(
            "Updating Copilot",
            incident="update_copilot",
            data=data,
            bot_id=copilot_id,
        )
        updated_copilot = update_copilot(
            copilot_id=copilot_id,
            name=data.get("name"),
            prompt_message=data.get("prompt_message"),
            swagger_url=data.get("swagger_url"),
            enhanced_privacy=data.get("enhanced_privacy"),
            smart_sync=data.get("smart_sync"),
            website=data.get("website"),
        )
        return {"chatbot": updated_copilot}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail={"error": "An error occurred", "details": str(e)}
        )


@copilot_router.post("/{copilot_id}/variables")
@copilot_router.put("/{copilot_id}/variables")
@copilot_router.patch("/{copilot_id}/variables")
def update_global_variables(copilot_id: str, new_variables: dict = Body(...)):
    try:
        find_one_or_fail_by_id(copilot_id)
        store_copilot_global_variables(
            copilot_id=copilot_id, new_variables=new_variables
        )
        return {"message": "JSON data stored successfully"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail={"error": "An error occurred", "details": str(e)}
        )


@copilot_router.delete("/{copilot_id}/variable/{variable_key}")
def delete_global_variable(copilot_id: str, variable_key: str):
    return delete_copilot_global_key(copilot_id=copilot_id, variable_key=variable_key)


@copilot_router.get("/{copilot_id}/variables")
def get_global_variables(copilot_id):
    try:
        chatbot = find_one_or_fail_by_id(copilot_id)
        return chatbot.global_variables, 200
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail={"error": "An error occurred", "details": str(e)}
        )


@copilot_router.post("/migrate/actions")
def migrate():
    auth_header = request.headers.get("Authorization")
    if auth_header:
        token = auth_header.split(" ")[1]

        if token == os.getenv("BASIC_AUTH_KEY"):
            migrate_actions()
            return {"message": "job started"}

    raise HTTPException(status_code=511, detail="Authorization Failed!")
