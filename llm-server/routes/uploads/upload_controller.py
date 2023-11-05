from flask import Blueprint, Response, request
from routes.uploads.upload_service import process_file

upload = Blueprint("upload", __name__)
from minio import Minio
import os

minio_server = os.environ.get("MINIO_SERVER", "localhost:9000")
minio_access_key = os.environ.get("MINIO_ACCESS_KEY", "Olw9PacGWKI1fgxxkrzc")
minio_secret_key = os.environ.get(
    "MINIO_SECRET_KEY", "QIvuZM3wBiKoHZxKtnocJaYgEI50M4qT1ndXzIdR"
)
minio_secure = bool(int(os.environ.get("MINIO_SECURE", 1)))
# minio_port = int(os.environ.get("MINIO_PORT", 9000))

# Instantiate a Minio client with the retrieved or default values
client = Minio(
    minio_server, access_key=minio_access_key, secret_key=minio_secret_key, secure=False
)
upload_controller = Blueprint("uploads", __name__)


@upload_controller.route("/presignedUrl", methods=["GET", "POST"])
def get_presigned_url() -> Response:
    filename = request.args.get("name")
    
    # this will be the folder name where all files related to this bot go, add validation

    try:
        url = client.presigned_put_object("opencopilot", filename)
        return url
    except Exception as e:
        return str(e), 500  # Handle errors appropriately


# This is a test function, shouldn't be used in production.
@upload_controller.route("/file/<name>", methods=["GET"])
def get_object_by_name(name: str) -> Response:
    try:
        object = client.get_object("opencopilot", name)
        return object
    except Exception as e:
        return str(e), 500  # Handle errors appropriately


@upload_controller.route("/file/ingest", methods=["GET", "POST"])
def start_file_ingestion() -> Response:
    try:
        bot_id = request.form.get("bot_id")
        file_url = request.form.get("file_url")

        if not bot_id:
            raise Exception("Bot id is required")
        
        if not file_url:
            raise Exception("File url is required")
        
        # Assuming process_file accepts bot_id and file_url as arguments
        process_file(bot_id, file_url)
        
        return "File ingestion started successfully", 200  # Return a success response
    except Exception as e:
        return str(e), 500  # Handle errors appropriately and return an error response