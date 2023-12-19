from typing import Optional

from bson.objectid import ObjectId
from flask import Blueprint, Response, request
from pydantic import BaseModel, Field, ValidationError

from utils.db import NoSQLDatabase

db_instance = NoSQLDatabase()
mongo = db_instance.get_db()

prompt_workflow = Blueprint("prompt", __name__)


class Prompt(BaseModel):
    bot_id: str = Field(..., min_length=3, max_length=50)
    app: str = Field(..., min_length=3, max_length=50)
    system_prompt: str = Field(..., min_length=10)
    summarization_prompt: str = Field(..., min_length=10)


@prompt_workflow.route("/prompt", methods=["POST"])
def create_prompt() -> Response:
    data = get_validated_prompt_data(request)
    if data is None:
        return Response(status=400)

    try:
        mongo.prompts.insert_one(data.model_dump())
    except Exception as e:
        print(f"Error creating prompt: {e}")
        return Response(status=500)

    return Response(status=201)


@prompt_workflow.route("/prompt/<id>", methods=["GET"])
def get_prompt(id: str) -> Response:
    prompt = mongo.prompts.find_one({"_id": ObjectId(id)})
    if prompt is None:
        return Response(status=404)

    return Response(prompt, status=200)


@prompt_workflow.route("/prompt/<id>", methods=["PUT"])
def update_prompt(id: str) -> Response:
    data = get_validated_prompt_data(request)
    if data is None:
        return Response(status=400)

    result = mongo.prompts.update_one({"_id": ObjectId(id)}, {"$set": data.dict()})
    if result.matched_count == 0:
        return Response(status=404)

    return Response(status=200)


@prompt_workflow.route("/prompt/<id>", methods=["DELETE"])
def delete_prompt(id: str) -> Response:
    result = mongo.prompts.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        return Response(status=404)

    return Response(status=204)

def get_validated_prompt_data(request) -> Optional[Prompt]:
    try:
        data = Prompt(**request.get_json())
        return data
    except ValidationError as e:
        print(f"Invalid input: {e}")
        return None
