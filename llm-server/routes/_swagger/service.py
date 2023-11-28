import json
from qdrant_client import QdrantClient
import yaml
from typing import Dict, List
from flask import Request
from prance import ResolvingParser
from opencopilot_utils.get_vector_store import get_vector_store
from opencopilot_utils import StoreOptions
from langchain.docstore.document import Document
from utils.get_logger import struct_log
import os
from utils.db import Database

client = QdrantClient(url=os.getenv("QDRANT_URL", "http://qdrant:6333"))

db_instance = Database()
mongo = db_instance.get_db()


def save_swaggerfile_to_mongo(
    filename: str, bot_id: str, swagger_doc: ResolvingParser
) -> bool:
    spec = swagger_doc.specification
    spec["meta"] = {"bot_id": bot_id, "swagger_url": filename}

    result = mongo.swagger_files.insert_one(spec)

    return result.acknowledged


def save_swagger_paths_to_qdrant(swagger_doc: ResolvingParser, bot_id: str):
    vector_store = get_vector_store(StoreOptions("apis"))

    # delete documents with metadata in api with the current bot id, before reingesting
    documents: List[Document] = []
    paths = swagger_doc.specification.get("paths")
    for path in paths:
        operations = paths[path]
        for method in operations:
            operation = operations[method]
            operation["method"] = method
            operation["path"] = path
            del operation["responses"]
            document = Document(
                page_content=f"{operation['summary']}; {operation['description']}"
            )
            document.metadata["bot_id"] = bot_id
            document.metadata["operation"] = operation

            struct_log.info(
                event="ingestion_doc",
                message="document before ingestion ---",
                data=document,
            )
            documents.append(document)

    vector_store.add_documents(documents)
    struct_log.info(event="api_ingestion_qdrant", documents=documents)


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

    inserted_id = mongo.swagger_files.insert_one(file_content).inserted_id

    return {"message": "File added successfully", id: str(inserted_id)}
