from flask import Flask, request, jsonify, Blueprint, request, Response
from flask_pymongo import PyMongo

import json, yaml
from bson import ObjectId

from utils.db import Database
from typing import Any
import requests

db_instance = Database()
mongo = db_instance.get_db()
swagger_workflow = Blueprint("swagger_workflow", __name__)


@swagger_workflow.route("/", methods=["GET"])
def get_swagger_files() -> Response:
    # Get page and page_size query params
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    # Calculate document skip/limit
    skip = (page - 1) * page_size
    limit = page_size

    # Query for paginated docs
    files = [
        doc.update({"_id": str(doc["_id"])}) or doc
        for doc in mongo.db.swagger_files.find({}, {}).skip(skip).limit(limit)
    ]

    # Get total docs count
    total = mongo.db.swagger_files.count_documents({})

    # Prepare response data
    data = {"total": total, "page": page, "page_size": page_size, "files": files}

    return jsonify(data)


@swagger_workflow.route("/", methods=["POST"])
def add_swagger_file():
    if request.content_type == "application/json":
        # JSON file
        file_content = request.get_json()

    elif "multipart/form-data" in request.content_type:
        # Uploaded file
        file = request.files.get("file")
        if file is None:
            return jsonify({"error": "File upload is required"}), 400

        if file.filename.endswith(".json"):
            try:
                file_content = json.load(file)
            except json.JSONDecodeError as e:
                return (
                    jsonify({"error": "Invalid JSON format in the uploaded file"}),
                    400,
                )

        elif file.filename.endswith(".yaml") or file.filename.endswith(".yml"):
            try:
                file_content = yaml.safe_load(file)
            except yaml.YAMLError as e:
                return (
                    jsonify({"error": "Invalid YAML format in the uploaded file"}),
                    400,
                )

    else:
        return jsonify({"error": "Unsupported content type"}), 400

    # Insert into MongoDB
    mongo.db.swagger_files.insert_one(file_content)

    return jsonify({"message": "File added successfully"})


@swagger_workflow.route("/<id>", methods=["GET"])
def get_swagger_file(id: str) -> Response:
    file = mongo.db.swagger_files.find_one({"_id": ObjectId(id)})
    if not file:
        return jsonify({"message": "Swagger file not found"})

    file["_id"] = str(file["_id"])
    return jsonify(file)


@swagger_workflow.route("/<id>", methods=["PUT"])
def update_swagger_file(id: str) -> Response:
    data = request.get_json()
    result = mongo.db.swagger_files.update_one({"_id": ObjectId(id)}, {"$set": data})
    if result.modified_count == 1:
        return jsonify({"message": "Swagger file updated successfully"})
    return jsonify({"message": "Swagger file not found"})


@swagger_workflow.route("/<id>", methods=["DELETE"])
def delete_swagger_file(id: str) -> Response:
    result = mongo.db.swagger_files.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Swagger file deleted successfully"})
    return jsonify({"message": "Swagger file not found"})
