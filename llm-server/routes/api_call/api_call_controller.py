from fastapi import APIRouter, HTTPException, Body, Depends
from models.repository.api_call_repository import APICallRepository
from utils.get_logger import CustomLogger
from pydantic import BaseModel
from models.di import get_api_call_repository

logger = CustomLogger(__name__)
api_call_router = APIRouter()


class ApiCallEntry(BaseModel):
    url: str
    path: str
    query_params: str
    path_params: str
    method: str


@api_call_router.post("/log")
async def log_api_call(
    api_call_entry: ApiCallEntry = Body(...),
    api_call_repo: APICallRepository = Depends(get_api_call_repository),
):
    if not all(
        [
            api_call_entry.url,
            api_call_entry.path,
            api_call_entry.query_params,
            api_call_entry.path_params,
            api_call_entry.method,
        ]
    ):
        raise HTTPException(status_code=400, detail="Missing required parameters")

    await api_call_repo.log_api_call(
        api_call_entry.url,
        api_call_entry.path,
        api_call_entry.method,
        api_call_entry.path_params,
        api_call_entry.query_params,
    )

    return {"message": "API call logged successfully"}
