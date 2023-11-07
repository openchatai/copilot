import os
from typing import Dict, Any, cast, Optional, List, Tuple

import logging
from custom_types.action_type import ActionType
from opencopilot_types.workflow_type import WorkflowDataType
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils import (
    run_workflow,
    check_workflow_in_store,
    hasSingleIntent,
    create_workflow_from_operation_ids,
)
from bson import ObjectId
import os
from typing import Dict, Any, cast
from routes.workflow.utils.router import get_action_type
from utils.db import Database
import json
from models.repository.chat_history_repo import create_chat_history
from utils.process_app_state import process_state
from prance import ResolvingParser
from utils.vector_db.add_workflow import add_workflow_data_to_qdrant
from uuid import uuid4
from langchain.docstore.document import Document
import traceback


db_instance = Database()
mongo = db_instance.get_db()

shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")

# Define constants for error messages
BASE_PROMPT_REQUIRED = "base_prompt is required"
TEXT_REQUIRED = "text is required"
SWAGGER_URL_REQUIRED = "swagger_url is required"
FAILED_TO_FETCH_SWAGGER_CONTENT = "Failed to fetch Swagger content"
FILE_NOT_FOUND = "File not found"
FAILED_TO_CALL_API_ENDPOINT = "Failed to call or map API endpoint"


def handle_request(data: Dict[str, Any]) -> Any:
    (
        text,
        swagger_url,
        session_id,
        base_prompt,
        headers,
        server_base_url,
        app,
    ) = extract_data(data)

    log_user_request(text)
    check_required_fields(base_prompt, text, swagger_url)

    swagger_doc = get_swagger_doc(swagger_url)

    try:
        current_state = process_state(app, headers)
        document = None
        # document, score = check_workflow_in_store(text, swagger_url)
        # this is disabled now, but this should trigger if workflow is already defined for this kind of user request
        if document:
            return handle_existing_workflow(
                document,
                text,
                headers,
                server_base_url,
                swagger_url,
                app,
                swagger_doc,
                session_id,
            )

        action = get_action_type(text, swagger_url)
        if action == ActionType.ASSISTANT_ACTION:
            bot_response = hasSingleIntent(
                swagger_doc, text, session_id, current_state, app
            )

            if len(bot_response.ids) >= 1:
                return handle_api_calls(
                    bot_response.ids,
                    swagger_doc,
                    text,
                    headers,
                    server_base_url,
                    swagger_url,
                    app,
                    session_id,
                )

            elif len(bot_response.ids) == 0:
                return handle_no_api_call(
                    swagger_url, session_id, text, bot_response.bot_message
                )

        elif action == ActionType.KNOWLEDGE_BASE_QUERY:
            pass
        elif action == ActionType.GENERAL_QUERY:
            pass

    except Exception as e:
        return handle_exception(e)


# Helper Functions


def extract_data(data: Dict[str, Any]) -> Tuple:
    text = cast(str, data.get("text"))
    swagger_url = cast(str, data.get("swagger_url", ""))
    session_id = cast(str, data.get("session_id", ""))
    base_prompt = data.get("base_prompt", "")
    headers = data.get("headers", {})
    server_base_url = cast(str, data.get("server_base_url", ""))
    app = headers.get("X-App-Name") or None
    return text, swagger_url, session_id, base_prompt, headers, server_base_url, app


def log_user_request(text: str) -> None:
    logging.info("[OpenCopilot] Got the following user request: {}".format(text))


def check_required_fields(base_prompt: str, text: str, swagger_url: str) -> None:
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
        ("swagger_url", SWAGGER_URL_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)


def get_swagger_doc(swagger_url: str) -> ResolvingParser:
    logging.info(f"Swagger url: {swagger_url}")
    swagger_doc: Optional[Dict[str, Any]] = mongo.swagger_files.find_one(
        {"meta.swagger_url": swagger_url}, {"meta": 0, "_id": 0}
    )

    if swagger_url.startswith("http:") or swagger_url.startswith("https:"):
        return ResolvingParser(url=swagger_url)
    elif swagger_url.endswith(".json") or swagger_url.endswith(".yaml"):
        return ResolvingParser(url=shared_folder + swagger_url)
    elif swagger_doc:
        return ResolvingParser(spec_string=swagger_doc)


def handle_existing_workflow(
    document: Document,  # lagnchaing
    text: str,
    headers: Dict[str, Any],
    server_base_url: str,
    swagger_url: str,
    app: str,
    swagger_doc: ResolvingParser,
    session_id: str,
) -> Dict[str, Any]:
    # use user defined workflows if exists, if not use auto_gen_workflow
    _workflow = mongo.workflows.find_one(
        {"_id": ObjectId(document.metadata["workflow_id"])}
    )

    if _workflow is None:
        _workflow = mongo.auto_gen_workflows.find_one(
            {"_id": ObjectId(document.metadata["workflow_id"])}
        )

    output = run_workflow(
        _workflow,
        swagger_doc,
        WorkflowData(text, headers, server_base_url, swagger_url, app),
        app,
    )

    create_chat_history(swagger_url, session_id, True, text)
    create_chat_history(
        swagger_url, session_id, False, output["response"] or output["error"]
    )
    return output


def handle_api_calls(
    ids: List[str],
    swagger_doc: ResolvingParser,
    text: str,
    headers: Dict[str, Any],
    server_base_url: str,
    swagger_url: str,
    app: str,
    session_id: str,
) -> Dict[str, Any]:
    _workflow = create_workflow_from_operation_ids(ids, swagger_doc, text)
    output = run_workflow(
        _workflow,
        swagger_doc,
        WorkflowData(text, headers, server_base_url, swagger_url, app),
        app,
    )

    _workflow["swagger_url"] = swagger_url
    # m_workflow = mongo.auto_gen_workflows.insert_one(_workflow)
    # add_workflow_data_to_qdrant(m_workflow.inserted_id, _workflow, swagger_url)

    create_chat_history(swagger_url, session_id, True, text)
    create_chat_history(
        swagger_url, session_id, False, output["response"] or output["error"]
    )
    return output


def handle_no_api_call(
    swagger_url: str, session_id: str, text: str, bot_message: str
) -> Dict[str, str]:
    create_chat_history(swagger_url, session_id, True, text)
    create_chat_history(swagger_url, session_id, False, bot_message)
    return {"response": bot_message}


def handle_exception(e: Exception) -> Dict[str, Any]:
    error_info = {
        "error": str(e),
        "traceback": traceback.format_exc(),
    }

    print(error_info)

    logging.error(
        "[OpenCopilot] Something went wrong when trying to get how many calls are required",
        exc_info=True,
    )

    return {"response": None, "error": str(e)}
