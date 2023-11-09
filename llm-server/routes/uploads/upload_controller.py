from flask import Blueprint, Response, request
from routes.uploads.upload_service import process_file
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify

upload = Blueprint("upload", __name__)
from minio import Minio
import os
import json

minio_server = os.environ.get("MINIO_SERVER", "localhost:9000")
minio_access_key = os.environ.get("MINIO_SERVER_ACCESS_KEY", "CnLRRDsK02lrsdvi3KtT")
minio_secret_key = os.environ.get(
    "MINIO_SERVER_SECRET_KEY", "rCmztWX9O35YaVUG1lEooBOjXHEMXqjz7H9cTbHb"
)


print(f"{minio_access_key}: {minio_secret_key}")
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


@upload_controller.route("/server/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Generate a secure filename and save the file to a temporary location
    filename = secure_filename(file.filename)
    file.save(filename)

    try:
        # Upload the file to MinIO server
        client.fput_object("opencopilot", filename, filename)
    except Exception as err:
        return jsonify({"error": f"MinIO upload error: {err.message}"}), 500
    finally:
        # Remove the temporary file
        os.remove(filename)

    return jsonify({"success": "File uploaded successfully"}), 200


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
        data = json.loads(request.data)
        bot_id = data.get("bot_id")
        file_urls = data.get("file_urls")

        if not bot_id:
            raise Exception("Bot id is required")

        if not file_urls:
            raise Exception("File url is required")

        # Assuming process_file accepts bot_id and file_url as arguments
        process_file(urls=file_urls, namespace=bot_id)

        return "File ingestion started successfully", 200  # Return a success response
    except Exception as e:
        return str(e), 500  # Handle errors appropriately and return an error response
