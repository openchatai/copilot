from flask import Flask, request, jsonify, Blueprint, request, Response
from flask_pymongo import PyMongo

from bson import ObjectId, json_util

app = Flask(__name__)
from utils.db import Database
from typing import Any

db_instance = Database()
mongo = db_instance.get_db()
swagger_workflow = Blueprint("swagger_workflow", __name__)


@swagger_workflow.route("/", methods=["GET"])
def get_swagger_files() -> Response:
    files = mongo.db.swagger_files.find_one({}, {"_id": 0})
    return jsonify(files)


@swagger_workflow.route("/", methods=["POST"])
def add_swagger_file() -> Response:
    file = request.get_json()
    mongo.db.swagger_files.insert_one(file)
    return jsonify({"message": "Swagger file added successfully"})


@swagger_workflow.route("/<id>", methods=["GET"])
def get_swagger_file(id: str) -> Response:
    file = mongo.db.swagger_files.find_one({"_id": ObjectId(id)})
    if not file:
        return jsonify({"message": "Swagger file not found"})
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
