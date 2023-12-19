from typing import Optional

from bson.objectid import ObjectId
from flask import Blueprint, Response, request
from pydantic import BaseModel, Field, ValidationError

from utils.db import NoSQLDatabase

db_instance = NoSQLDatabase()
mongo = db_instance.get_db()

prompt_template_workflow = Blueprint("prompt_template", __name__)


class PromptTemplate(BaseModel):
    app: str = Field(..., min_length=3, max_length=50)
    system_prompt: str = Field(..., min_length=10)
    summarization_prompt: str = Field(..., min_length=10)


@prompt_template_workflow.route("/prompt-template", methods=["POST"])
def create_prompt_template() -> Response:
    data = get_validated_prompt_template_data(request)
    if data is None:
        return Response(status=400)

    try:
        mongo.prompt_templates.insert_one(data.model_dump())
    except Exception as e:
        print(f"Error creating prompt template: {e}")
        return Response(status=500)

    return Response(status=201)


@prompt_template_workflow.route("/prompt-template/<id>", methods=["GET"])
def get_prompt_template(id: str) -> Response:
    template = mongo.prompt_templates.find_one({"_id": ObjectId(id)})
    if template is None:
        return Response(status=404)

    return Response(template, status=200)


@prompt_template_workflow.route("/prompt-template/<id>", methods=["PUT"])
def update_prompt_template(id: str) -> Response:
    data = get_validated_prompt_template_data(request)
    if data is None:
        return Response(status=400)

    result = mongo.prompt_templates.update_one(
        {"_id": ObjectId(id)}, {"$set": data.dict()}
    )
    if result.matched_count == 0:
        return Response(status=404)

    return Response(status=200)


@prompt_template_workflow.route("/prompt-template/<id>", methods=["DELETE"])
def delete_prompt_template(id: str) -> Response:
    result = mongo.prompt_templates.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 0:
        return Response(status=404)

    return Response(status=204)


def get_validated_prompt_template_data(request) -> Optional[PromptTemplate]:
    try:
        data = PromptTemplate(**request.get_json())
        return data
    except ValidationError as e:
        print(f"Invalid input: {e}")
        return None
