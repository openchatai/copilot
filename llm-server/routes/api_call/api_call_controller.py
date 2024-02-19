from fastapi import APIRouter, FastAPI, HTTPException, Body, Depends
from models.repository.api_call_repository import APICallRepository
from sqlalchemy.orm import sessionmaker
from shared.models.opencopilot_db.database_setup import engine
from utils.get_logger import CustomLogger
from sqlalchemy.orm import Session
from pydantic import BaseModel

logger = CustomLogger(__name__)
api_call_router = APIRouter()

SessionLocal = sessionmaker(bind=engine)


class ApiCallEntry(BaseModel):
    url: str
    path: str
    query_params: str
    path_params: str
    method: str


def get_db_session():
    db_session = SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


@api_call_router.post("/log")
def log_api_call(
    api_call_entry: ApiCallEntry = Body(...),
    db_session: Session = Depends(get_db_session),
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

    repository = APICallRepository(db_session)
    repository.log_api_call(
        api_call_entry.url,
        api_call_entry.path,
        api_call_entry.method,
        api_call_entry.path_params,
        api_call_entry.query_params,
    )

    return {"message": "API call logged successfully"}
