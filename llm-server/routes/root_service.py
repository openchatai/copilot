import json
import os
from typing import Dict, Any, cast, Optional

import logging
from dotenv import load_dotenv
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils import (
    run_workflow,
    check_workflow_in_store,
    fetch_swagger_text,
    hasSingleIntent,
    create_workflow_from_operation_ids,
)
from bson import ObjectId
import os
from dotenv import load_dotenv
from typing import Dict, Any, cast
from utils.db import Database
import json
from api_caller.base import try_to_match_and_call_api_endpoint
from models.repository.chat_history_repo import create_chat_history
from utils.process_app_state import process_state
from prance import ResolvingParser
from utils.vector_db.add_workflow import add_workflow_data_to_qdrant
from uuid import uuid4


db_instance = Database()
mongo = db_instance.get_db()

load_dotenv()
shared_folder = os.getenv("SHARED_FOLDER", "/app/shared_data/")

# Define constants for error messages
BASE_PROMPT_REQUIRED = "base_prompt is required"
TEXT_REQUIRED = "text is required"
SWAGGER_URL_REQUIRED = "swagger_url is required"
FAILED_TO_FETCH_SWAGGER_CONTENT = "Failed to fetch Swagger content"
FILE_NOT_FOUND = "File not found"
FAILED_TO_CALL_API_ENDPOINT = "Failed to call or map API endpoint"


def handle_request(data: Dict[str, Any]) -> Any:
    text: str = cast(str, data.get("text"))
    swagger_url = cast(str, data.get("swagger_url", ""))
    session_id = cast(str, data.get("session_id", ""))
    base_prompt = data.get("base_prompt", "")
    headers = data.get("headers", {})
    server_base_url = cast(str, data.get("server_base_url", ""))
    app = headers.get("X-App-Name") or None

    logging.info("[OpenCopilot] Got the following user request: {}".format(text))
    for required_field, error_msg in [
        ("base_prompt", BASE_PROMPT_REQUIRED),
        ("text", TEXT_REQUIRED),
        ("swagger_url", SWAGGER_URL_REQUIRED),
    ]:
        if not locals()[required_field]:
            raise Exception(error_msg)

    swagger_doc: Dict[str, Any] = mongo.swagger_files.find_one(
        {"meta.swagger_url": swagger_url}, {"meta": 0, "_id": 0}
    )

    # need to test if prance works with document saved in mongodb

    if swagger_url.startswith("http:") or swagger_url.startswith("https:"):
        swagger_doc = ResolvingParser(url=swagger_url)
    elif swagger_doc:
        swagger_doc = ResolvingParser(spec_string=swagger_doc)
    else:
        swagger_doc = ResolvingParser(url=shared_folder + swagger_url)
    try:
        logging.info(
            "[OpenCopilot] Trying to figure out if the user request require 1) APIs calls 2) If yes how many "
            "of them"
        )
        current_state = process_state(app, headers)

        logging.info(f"Received app configuration: {app}")
        bot_response = hasSingleIntent(swagger_doc, text, session_id, current_state)
        if len(bot_response.ids) >= 1:
            logging.info(
                "[OpenCopilot] Apparently, the user request require calling one or more API endpoint "
                "to get the job done"
            )

            # check workflow in mongodb, if present use that, else ask planner to create a workflow based on summaries
            # then call run_workflow on that
            (document, score) = check_workflow_in_store(text, swagger_url)

            _workflow = None
            if document:
                _workflow = mongo.workflows.find_one(
                    {"_id": ObjectId(document.metadata["workflow_id"])}
                )
            else:
                _workflow = create_workflow_from_operation_ids(
                    bot_response.ids, swagger_doc, text
                )
            output = run_workflow(
                _workflow,
                swagger_doc,
                WorkflowData(text, headers, server_base_url, swagger_url, app),
                app,
            )

            mongo.auto_gen_workflows.insert_one(
                {"workflow": _workflow, "swagger_url": swagger_url}
            )

            # saving this, to avoid llm call for similar queries
            add_workflow_data_to_qdrant(str(uuid4()), _workflow, swagger_url)

            create_chat_history(swagger_url, session_id, True, text)
            # bot response
            create_chat_history(
                swagger_url, session_id, False, output["response"] or output["error"]
            )

            return output

        elif len(bot_response.ids) == 0:
            logging.info("[OpenCopilot] The user request doesnot require an api call")

            create_chat_history(swagger_url, session_id, True, text)
            # bot response
            create_chat_history(
                swagger_url, session_id, False, bot_response.bot_message
            )
            return {"response": bot_response.bot_message}

        else:
            logging.info(
                "[OpenCopilot] The user request can be handled in single API call"
            )

    except Exception as e:
        logging.info(
            "[OpenCopilot] Something went wrong when try to get how many calls is required"
        )

        return {"response": None, "error": str(e)}
