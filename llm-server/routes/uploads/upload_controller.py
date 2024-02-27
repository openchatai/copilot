import json
import os
import secrets
from typing import Optional

import validators
from flask import Blueprint, Response, request
from werkzeug.utils import secure_filename
from models.repository.copilot_repo import find_or_fail_by_bot_id

from routes.uploads.celery_service import celery
from utils.llm_consts import SHARED_FOLDER

upload = Blueprint("upload", __name__)

os.makedirs(SHARED_FOLDER, exist_ok=True)

upload_controller = Blueprint("uploads", __name__)


def generate_unique_filename(filename: Optional[str]) -> str:
    """Generate a unique filename with a random prefix.

    Args:
        filename: The original filename

    Returns:
        The unique filename
    """
    if filename is None:
        filename = ""

    random_prefix: str = secrets.token_hex(4)
    secure_name: str = secure_filename(filename)
    unique_name: str = f"{random_prefix}_{secure_name}"
    return unique_name


@upload_controller.route("/server/upload", methods=["POST"])
def upload_file() -> Response:
    if "file" not in request.files:
        return Response(
            response=json.dumps({"error": "No file part"}),
            status=400,
            mimetype="application/json",
        )

    file = request.files["file"]

    if file.filename == "":
        return Response(
            response=json.dumps({"error": "No selected file"}),
            status=400,
            mimetype="application/json",
        )

    # Generate a unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(SHARED_FOLDER, unique_filename)

    try:
        # Save the file to the shared folder
        file.save(file_path)
    except Exception as e:
        return Response(
            response=json.dumps({"error": f"Failed to save file: {str(e)}"}),
            status=500,
            mimetype="application/json",
        )

    return Response(
        response=json.dumps(
            {
                "success": "File uploaded successfully",
                "filename": unique_filename,
                "file_path": file_path,
            }
        ),
        status=200,
        mimetype="application/json",
    )


@upload_controller.route("/file/ingest", methods=["GET", "POST"])
def start_file_ingestion() -> Response:
    try:
        data = json.loads(request.data)
        bot_id = data.get("bot_id")
        bot_token = str(find_or_fail_by_bot_id(bot_id).token)
        filenames = data.get("filenames")

        if not bot_id:
            raise Exception("Bot id is required")

        if not filenames:
            raise Exception("File names required")

        for filename in filenames:
            # Check if the file extension is PDF
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
                    "workers.tasks.web_crawl.web_crawl",
                    args=[filename, bot_id, bot_token],
                )
            else:
                print(f"Received: {filename}, is neither a pdf nor a url. ")

        return Response(
            status=200, response="Datasource ingestion started successfully"
        )
    except Exception as e:
        return Response(response=str(e), status=500)


@upload_controller.route("/web/retry", methods=["POST"])
def retry_failed_web_crawl():
    """Re-runs a failed web crawling task.

    Args:
      website_data_source_id (str): The ID of the website data source to resume crawling.

    Returns:
      Response: A Flask Response object with the following JSON object:
        {
          "status": "success" | "failed",
          "error": error message if any
        }
    """

    try:
        if request.json:
            website_data_source_id = request.json["website_data_source_id"]
            celery.send_task(
                "workers.web_crawl.resume_failed_website_scrape",
                args=[website_data_source_id],
            )

        return Response(
            status=200,
            mimetype="application/json",
            response={
                "status": "success",
                "error": None,
            },
        )

    except Exception as e:
        return Response(
            status=500,
            mimetype="application/json",
            response={
                "status": "failed",
                "error": str(e),
            },
        )


@upload_controller.route("/pdf/retry", methods=["POST"])
def retry_failed_pdf_crawl():
    """Re-runs a failed PDF crawl.

    Args:
      chatbot_id: The ID of the chatbot.
      file_name: The name of the PDF file to crawl.

    Returns:
      A JSON object with the following fields:
        status: The status of the PDF crawl.
        error: The error message, if any.
    """

    try:
        if request.json:
            chatbot_id = request.json["chatbot_id"]
            file_name = request.json["file_name"]
            celery.send_task(
                "workers.pdf_crawl.retry_failed_pdf_crawl", args=[chatbot_id, file_name]
            )

            return Response(
                status=415,
                response={
                    "status": "415 Unsupported Media Type",
                    "error": "Unsupported Media Type",
                },
                mimetype="application/json",
            )
        else:
            return Response(
                status=200,
                response={"status": "retrying", "error": None},
                mimetype="application/json",
            )
    except Exception as e:
        # Handle the exception and return a proper Response object
        return Response(
            status=500,
            response={"status": "failed", "error": str(e)},
            mimetype="application/json",
        )
