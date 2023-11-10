from flask import Blueprint, Response, request
from werkzeug.utils import secure_filename
import secrets
from flask import request, jsonify
from routes.uploads.celery_service import celery
import validators

upload = Blueprint("upload", __name__)
import os, json, uuid

UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "/app/shared_data")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

upload_controller = Blueprint("uploads", __name__)


def generate_unique_filename(filename):
    # Generate a random prefix using secrets module
    random_prefix = secrets.token_hex(4)  # Adjust the length of the prefix as needed

    # Combine the random prefix and the secure filename
    unique_filename = f"{random_prefix}_{secure_filename(filename)}"
    return unique_filename


@upload_controller.route("/server/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Generate a unique filename
    unique_filename = generate_unique_filename(file.filename)
    file_path = os.path.join(
        os.getenv("UPLOAD_FOLDER", "/app/shared_data"), unique_filename
    )

    try:
        # Save the file to the shared folder
        file.save(file_path)
    except Exception as e:
        return jsonify({"error": f"Failed to save file: {str(e)}"}), 500

    return (
        jsonify(
            {
                "success": "File uploaded successfully",
                "filename": unique_filename,
                "file_path": file_path,
            }
        ),
        200,
    )


@upload_controller.route("/file/ingest", methods=["GET", "POST"])
def start_file_ingestion() -> Response:
    try:
        data = json.loads(request.data)
        bot_id = data.get("bot_id")
        filenames = data.get("filenames")

        if not bot_id:
            raise Exception("Bot id is required")

        if not filenames:
            raise Exception("File names required")

        for filename in filenames:
            # Check if the file extension is PDF
            if filename.lower().endswith(".pdf"):
                celery.send_task(
                    "tasks.process_pdfs.process_pdf", args=[filename, bot_id]
                )
            elif validators.url(filename):
                celery.send_task("tasks.web_crawl.web_crawl", args=[filename, bot_id])
            else:
                print(f"Received: {filename}, is neither a pdf nor a url. ")

        return (
            "Datasource ingestion started successfully",
            200,
        )
    except Exception as e:
        return str(e), 500  # Handle errors appropriately and return an error response
