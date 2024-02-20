import os
import secrets
import validators
from typing import Optional

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException,
    Request,
    Response,
)
from starlette.responses import JSONResponse
from werkzeug.utils import secure_filename

from routes.uploads.celery_service import celery
from utils.llm_consts import SHARED_FOLDER

upload_router = APIRouter()

os.makedirs(SHARED_FOLDER, exist_ok=True)


def generate_unique_filename(filename: Optional[str]) -> str:
    """Generate a unique filename with a random prefix."""

    if filename is None:
        filename = ""

    random_prefix: str = secrets.token_hex(4)
    secure_name: str = secure_filename(filename)
    unique_name: str = f"{random_prefix}_{secure_name}"
    return unique_name


@upload_router.post("/server/upload")
async def upload_file(file: UploadFile = File(...)) -> Response:

    if file.filename == "":
        raise HTTPException(status_code=400, detail="No selected file")

    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(SHARED_FOLDER, unique_filename)

    try:
        # Save the file to the shared folder
        with open(file_path, "wb+") as f:
            f.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    return JSONResponse(
        content={
            "success": "File uploaded successfully",
            "filename": unique_filename,
            "file_path": file_path,
        },
        status_code=200,
    )


@upload_router.post("/file/ingest")
async def start_file_ingestion(request: Request):

    data = await request.json()

    bot_id = data.get("bot_id")
    filenames = data.get("filenames")

    if not bot_id:
        raise HTTPException(status_code=400, detail="Bot id is required")

    if not filenames:
        raise HTTPException(status_code=400, detail="File names required")

    for filename in filenames:
        if filename.lower().endswith(".pdf"):
            celery.send_task(
                "workers.tasks.process_pdfs.process_pdf", args=[filename, bot_id]
            )
        elif filename.lower().endswith(".md"):
            celery.send_task(
                "workers.tasks.process_markdown.process_markdown",
                args=[filename, bot_id],
            )
        elif validators.url(filename):
            celery.send_task(
                "workers.tasks.web_crawl.web_crawl", args=[filename, bot_id]
            )
        else:
            print(f"Received: {filename}, is neither a pdf, markdown nor a url.")

    return Response(
        status_code=200, content="Datasource ingestion started successfully"
    )


@upload_router.post("/web/retry")
async def retry_failed_web_crawl(request: Request):
    """Re-runs a failed web crawling task."""

    data = await request.json()
    website_data_source_id = data["website_data_source_id"]
    celery.send_task(
        "workers.web_crawl.resume_failed_website_scrape", args=[website_data_source_id]
    )

    return JSONResponse(status_code=200, content={"status": "success", "error": None})


@upload_router.post("/pdf/retry")
async def retry_failed_pdf_crawl(request: Request):
    """Re-runs a failed PDF crawl."""

    data = await request.json()
    chatbot_id = data["chatbot_id"]
    file_name = data["file_name"]
    celery.send_task(
        "workers.pdf_crawl.retry_failed_pdf_crawl", args=[chatbot_id, file_name]
    )

    return JSONResponse(status_code=200, content={"status": "retrying", "error": None})
