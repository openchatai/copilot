import json
import yaml

from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()
from typing import Dict
from flask import Request


def add_swagger_file(request: Request, id: str) -> Dict[str, str]:
    if request.content_type == "application/json":
        # JSON file
        file_content = request.get_json()

    elif "multipart/form-data" in request.content_type:
        # Uploaded file
        file = request.files.get("file")
        if file is None:
            return {"error": "File upload is required"}

        if file.filename and file.filename.endswith(".json"):
            try:
                file_content = json.load(file)
            except json.JSONDecodeError as e:
                return {"error": "Invalid JSON format in uploaded file"}

        elif file.filename and (
            file.filename.endswith(".yaml") or file.filename.endswith(".yml")
        ):
            try:
                file_content = yaml.safe_load(file)
            except yaml.YAMLError as e:
                return {"error": "Invalid YAML format in uploaded file"}

    else:
        return {"error": "Unsupported content type"}

    # Insert into MongoDB
    file_content["bot_id"] = id
    inserted_id = mongo.swagger_files.insert_one(file_content).inserted_id

    return {"message": "File added successfully", id: str(inserted_id)}
