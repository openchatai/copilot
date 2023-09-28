from flask import Flask, request, jsonify, Blueprint, request, Response

import json, yaml
from bson import ObjectId
import routes._swagger.service as swagger_service

from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()
_swagger = Blueprint("_swagger", __name__)


@_swagger.route("/b/<id>", methods=["GET"])
def get_swagger_files(id: str) -> Response:
    # Get page and page_size query params
    page = int(request.args.get("page", 1))
    page_size = int(request.args.get("page_size", 10))

    # Calculate document skip/limit
    skip = (page - 1) * page_size
    limit = page_size

    # Query for paginated docs
    files = [
        doc.update({"_id": str(doc["_id"])}) or doc
        for doc in mongo.swagger_files.find({"bot_id": id}, {}).skip(skip).limit(limit)
    ]

    # Get total docs count
    total = mongo.swagger_files.count_documents({})

    # Prepare response data
    data = {"total": total, "page": page, "page_size": page_size, "files": files}

    return jsonify(data)


@_swagger.route("/b/<id>", methods=["POST"])
def add_swagger_file(id) -> Response:
    result = swagger_service.add_swagger_file(request, id)
    return jsonify(result)


@_swagger.route("/<_id>", methods=["GET"])
def get_swagger_file(_id: str) -> Response:
    file = mongo.swagger_files.find_one({"_id": ObjectId(_id)})
    if not file:
        return jsonify({"message": "Swagger file not found"})

    file["_id"] = str(file["_id"])
    return jsonify(file)


@_swagger.route("/transform/<_id>", methods=["GET"])
def get_transformed_swagger_file(_id: str) -> Response:
    swagger_json = mongo.swagger_files.aggregate(
        [
            {"$match": {"_id": ObjectId(_id)}},
            {"$project": {"paths": 1}},
            {
                "$project": {
                    "methods": {
                        "$reduce": {
                            "input": {"$objectToArray": "$paths"},
                            "initialValue": [],
                            "in": {
                                "$concatArrays": [
                                    "$$value",
                                    {
                                        "$map": {
                                            "input": {"$objectToArray": "$$this.v"},
                                            "as": "path",
                                            "in": {
                                                "$mergeObjects": [
                                                    "$$path.v",
                                                    {
                                                        "method": "$$path.k",
                                                        "path": "$$this.k",
                                                    },
                                                ]
                                            },
                                        }
                                    },
                                ]
                            },
                        }
                    }
                }
            },
            {
                "$project": {
                    "methods.requestBody": 0,
                    "methods.responses": 0,
                    "methods.security": 0,
                }
            },
        ]
    )

    swagger_json = [doc.update({"_id": str(doc["_id"])}) or doc for doc in swagger_json]

    return jsonify(list(swagger_json))


@_swagger.route("/<_id>", methods=["PUT"])
def update_swagger_file(_id: str) -> Response:
    data = request.get_json()
    result = mongo.swagger_files.update_one({"_id": ObjectId(_id)}, {"$set": data})
    if result.modified_count == 1:
        return jsonify({"message": "Swagger file updated successfully"})
    return jsonify({"message": "Swagger file not found"})


@_swagger.route("/<_id>", methods=["DELETE"])
def delete_swagger_file(_id: str) -> Response:
    result = mongo.swagger_files.delete_one({"_id": ObjectId(_id)})
    if result.deleted_count == 1:
        return jsonify({"message": "Swagger file deleted successfully"})
    return jsonify({"message": "Swagger file not found"})
