from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.status import HTTP_500_INTERNAL_SERVER_ERROR
from utils.vector_store_setup import init_qdrant_collections
from shared.models.opencopilot_db.database_setup import create_database_schema
from routes.flow.flow_controller import flow_router
from routes.action.action_controller import router
from routes.chat.chat_controller import chat_router
from routes.copilot.copilot_controller import copilot_router
from routes.uploads.upload_controller import upload_router
from routes.api_call.api_call_controller import api_call_router
from routes.data_source.data_source_controller import datasource_router
from routes.search.search_controller import search_router
from routes.typing.powerup_controller import powerup_router
from utils.get_logger import CustomLogger

init_qdrant_collections()

logger = CustomLogger(__name__)

create_database_schema()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register your routers here
app.include_router(flow_router, prefix="/backend/flows", tags=["flows"])
app.include_router(chat_router, prefix="/backend/chat", tags=["chat"])
app.include_router(copilot_router, prefix="/backend/copilot", tags=["copilot"])
app.include_router(upload_router, prefix="/backend/uploads", tags=["uploads"])
app.include_router(api_call_router, prefix="/backend/api_calls", tags=["api_calls"])
app.include_router(
    datasource_router, prefix="/backend/data_sources", tags=["data_sources"]
)
app.include_router(action_router, prefix="/backend/actions", tags=["actions"])
app.include_router(powerup_router, prefix="/backend/powerup", tags=["powerup"])
app.include_router(search_router, prefix="/backend/search", tags=["search"])


@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"detail": exc.detail},
        )
    logger.error("Unhandled server error", exc_info=exc)
    return JSONResponse(
        status_code=HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal Server Error"},
    )
