from typing import Optional, Dict

from fastapi import (
    APIRouter,
    Depends,
    File,
    Query,
    UploadFile,
    HTTPException,
)
from fastapi.responses import JSONResponse
from starlette.requests import Request

from models.repository.chat_history_repo import ChatHistoryRepo
from models.repository.copilot_repo import CopilotRepository
from models.di import get_chat_history_repository, get_copilot_repository
from routes.analytics.analytics_service import upsert_analytics_record
from routes.chat.chat_dto import ChatInput
from routes.chat.implementation.chain_strategy import ChainStrategy
from routes.chat.implementation.functions_strategy import FunctionStrategy
from routes.chat.implementation.handler_interface import ChatRequestHandler
from routes.chat.implementation.tools_strategy import ToolStrategy
from utils.get_logger import CustomLogger
from utils.llm_consts import X_App_Name, chat_strategy, ChatStrategy, get_bot_token
from utils.sqlalchemy_objs_to_json_array import sqlalchemy_objs_to_json_array

import openai
import uuid
import os
from pydantic import BaseModel

logger = CustomLogger(module_name=__name__)

chat_router = APIRouter()


async def get_validated_data(request: Request) -> Optional[dict]:
    data = await request.json()
    if not data:
        return None

    required_keys = {"app", "system_prompt", "summarization_prompt"}

    if not required_keys.issubset(data.keys()):
        print(
            f"Missing required keys in request: {required_keys.difference(data.keys())}"
        )
        return None
    return data


@chat_router.get("/sessions/{session_id}/chats")
async def get_session_chats(
    session_id: str,
    limit=20,
    page=1,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
):
    # Calculate offset based on the page number and limit
    offset = (page - 1) * limit

    chats, total_messages = (
        await chat_history_repo.get_all_chat_history_by_session_id_with_total(
            session_id, limit, offset
        )
    )

    chats_filtered = [
        {
            "chatbot_id": chat.chatbot_id,
            "created_at": chat.created_at,
            "from_user": chat.from_user,
            "id": chat.id,
            "message": chat.message,
            "session_id": chat.session_id,
            "debug_json": chat.debug_json,
        }
        for chat in chats
    ]

    # Calculate total pages
    total_pages = (total_messages + limit - 1) // limit

    response_data = {"data": chats_filtered, "total_pages": total_pages}

    return response_data


@chat_router.get("/b/{bot_id}/chat_sessions")
async def get_chat_sessions(
    bot_id: str,
    limit: int = Query(20, ge=1),
    page: int = Query(1, ge=1),
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
):
    # Calculate offset based on the page number and limit
    offset = (page - 1) * limit

    (
        chat_history_sessions,
        total_pages,
    ) = await chat_history_repo.get_unique_sessions_with_first_message_by_bot_id(
        bot_id, limit, offset
    )

    return {"data": chat_history_sessions, "total_pages": total_pages}


@chat_router.get("/init")
async def init_chat(
    request: Request,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    bot_token = request.headers.get("X-Bot-Token")
    session_id = request.headers.get("X-Session-Id")

    history = []
    if session_id:
        chats, _ = (
            await chat_history_repo.get_all_chat_history_by_session_id_with_total(
                session_id, 200, 0
            )
        )
        history = sqlalchemy_objs_to_json_array(chats) or []

    if not bot_token:
        return (
            JSONResponse(
                status_code=404,
                content={
                    "type": "text",
                    "response": {"text": "Could not find bot token"},
                },
            ),
        )

    try:
        bot = await copilot_repo.find_one_or_fail_by_token(bot_token)
        # Replace 'faq' and 'initialQuestions' with actual logic or data as needed.
        return {
            "bot_name": bot.name,
            "logo": "logo",
            "faq": [],  # Replace with actual FAQ data
            "initial_questions": [],
            "history": history,
        }
    except Exception as e:
        return JSONResponse(status_code=404, content="Bot Not Found")


@chat_router.post("/send")
async def send_chat(chat_input: ChatInput, bot_token: str = Depends(get_bot_token)):
    message = chat_input.content
    session_id = chat_input.session_id
    headers_from_json = chat_input.headers or {}

    return await handle_chat_send_common(
        message, bot_token, session_id, headers_from_json, is_streaming=False
    )


async def handle_chat_send_common(
    message: str,
    bot_token: Optional[str],
    session_id: str,
    headers_from_json: Dict[str, str],
    is_streaming: bool,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    app_name = headers_from_json.pop(X_App_Name, None)
    if not message:
        raise HTTPException(status_code=400, detail="Content cannot be null")

    if not bot_token:
        return {"status": 400, "detail": "bot token is required"}

    logger.error(
        "chat/send",
        error=Exception("Something went wrong"),
        bot_token=bot_token,
        x_message=message,
        session_id=session_id,
    )

    try:
        bot = await copilot_repo.find_one_or_fail_by_token(bot_token)
        base_prompt = bot.prompt_message

        strategy: ChatRequestHandler = ChainStrategy()
        if chat_strategy == ChatStrategy.function:
            strategy = FunctionStrategy()

        elif chat_strategy == ChatStrategy.tool:
            strategy = ToolStrategy()

        headers_from_json.update(bot.global_variables or {})

        result = await strategy.handle_request(
            message,
            session_id,
            str(base_prompt),
            str(bot.id),
            headers_from_json,
            app_name,
            is_streaming,
        )

        if (
            result.message is not None
            or len(result.api_request_response.api_requests) > 0
            or result.error is not None
        ):
            chat_records = [
                {
                    "session_id": session_id,
                    "from_user": True,
                    "message": message,
                },
                {
                    "session_id": session_id,
                    "from_user": False,
                    "message": result.message or result.error,
                    "api_called": result.api_called,
                    "knowledgebase_called": result.knowledgebase_called,
                    "debug_json": result.api_request_response.api_requests,
                },
            ]

            upsert_analytics_record(
                chatbot_id=str(bot.id), successful_operations=1, total_operations=1
            )
            await chat_history_repo.create_chat_histories(str(bot.id), chat_records)

        if result.error:
            logger.error("chat_conversation_error", message=result.error)

        return {"type": "text", "response": {"text": result.message}}
    except Exception as e:
        logger.error(
            "An exception occurred",
            incident="chat/send",
            error=e,
            bot_token=bot_token,
        )
        return {
            "status": 500,
            "detail": f"I'm unable to help you at the moment, please try again later. **code: b500**\n```{e}```",
        }


@chat_router.get("/analytics/{bot_id}")
async def get_analytics_by_email(
    bot_id: str,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
    copilot_repo: CopilotRepository = Depends(get_copilot_repository),
):
    result = await chat_history_repo.get_analytics(bot_id)
    return result


@chat_router.get("/sessions/count/{email}")
async def session_counts_by_user(
    email: str,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
):
    response = await chat_history_repo.get_session_counts_by_user(email)
    return response


@chat_router.get("/actions/most_called/{bot_id}")
async def m_called_actions_by_bot(
    bot_id: str,
    chat_history_repo: ChatHistoryRepo = Depends(get_chat_history_repository),
):
    response = await chat_history_repo.most_called_actions_by_bot(bot_id)
    return response


@chat_router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    if not file.filename.endswith(".m4a") and not file.filename.endswith(".mp3"):
        return {"status": 400, "detail": "Invalid file type"}

    file_name = "/tmp/audio_" + str(uuid.uuid4()) + ".m4a"
    file_path = f"{file_name}"
    with open(file_path, "wb+") as file_object:
        file_object.write(await file.read())

    transcript = openai.audio.transcriptions.create(
        model="whisper-1", file=open(file_name, "rb"), response_format="text"
    )

    os.remove(file_name)

    return {"text": transcript}
