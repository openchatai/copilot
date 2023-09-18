from typing import Dict, List, Union
from uuid import uuid4

from typing import Any
from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()


def determine_and_save_followup_context(
    api_payload: Dict[str, Dict[str, str]],
    text: str,
    api_responses: Dict[str, Union[str, None]],
) -> Dict[str, Union[bool, List[str]]]:
    # Initialize an empty list to store follow-up questions
    followup_questions = []

    for field, field_info in api_payload.items():
        if field not in api_responses or api_responses[field] is None:
            # If the field is missing, generate a follow-up question
            followup_question = f"What is the value for {field_info['description']}?"
            followup_questions.append(followup_question)

    if followup_questions:
        context_identifier = save_context_to_mongodb(
            {
                "api_responses": api_responses,
                "text": text,
                "followup_qns": followup_questions,
            }
        )
        return {
            "followup_required": True,
            "followup_questions": followup_questions,
            "uuid": context_identifier,
        }
    else:
        return {"followup_required": False}


def save_context_to_mongodb(context_data: Any) -> str:
    # Create a unique UUID for the current context
    context_uuid = str(uuid4())

    api_flow_contexts = mongo.api_flow_contexts

    # Insert the context data into the MongoDB collection
    context_data["_id"] = context_uuid  # Use the UUID as the document ID
    api_flow_contexts.insert_one(context_data)

    return context_uuid
