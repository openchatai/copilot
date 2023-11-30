import os
from typing import Dict, Any, Optional, List

import logging
from custom_types.action_type import ActionType
from integrations.custom_prompts.prompt_loader import load_prompts
from routes.workflow.typings.response_dict import ResponseDict
from routes.workflow.typings.run_workflow_input import WorkflowData
from routes.workflow.utils import (
    run_workflow,
    check_workflow_in_store,
    hasSingleIntent,
    create_workflow_from_operation_ids,
)
from opencopilot_utils import get_llm, StoreOptions
from bson import ObjectId
from routes.workflow.utils.router import get_action_type, get_relevant_apis_summaries, get_relevant_docs, process_conversation_step
from utils.chat_models import CHAT_MODELS
from utils.db import Database
from models.repository.chat_history_repo import get_chat_history_for_retrieval_chain
from utils.get_chat_model import get_chat_model
from utils.process_app_state import process_state
from prance import ResolvingParser
from langchain.docstore.document import Document
from opencopilot_utils.get_vector_store import get_vector_store
from langchain.vectorstores.base import VectorStore
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationalRetrievalChain
from utils import struct_log

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

chat = get_chat_model(CHAT_MODELS.gpt_3_5_turbo_16k)


def handle_request(
    text: str,
    swagger_url: str,
    session_id: str,
    base_prompt: str,
    bot_id: str,
    headers: Dict[str, str],
    server_base_url: str,
    app: Optional[str],
) -> ResponseDict:
    log_user_request(text)
    check_required_fields(base_prompt, text, swagger_url)
    try:
        context = get_relevant_docs(text, bot_id) or None
        apis = get_relevant_apis_summaries(text, bot_id)
        step = process_conversation_step(
            user_requirement=text,
            context=context,
            session_id=session_id,
            app=app,
            api_summaries=apis,
        )
        
        return {"error": None, "response": step.bot_message}
    except Exception as e:
        return handle_exception(e, "handle_request")


# Helper Functions


def get_condense_prompt_by_mode(mode: str) -> str:
    condense_prompts = {
        "assistant": """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

    Chat History:
    {chat_history}
    Follow Up Input: {question}
    Standalone question:""",
        "pair_programmer": """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.  

    Chat History:
    {chat_history}
    Follow Up Input: {question}
    Standalone question:""",
    }

    if mode in condense_prompts:
        return condense_prompts[mode]

    return """Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

    Chat History:
    {chat_history} 
    Follow Up Input: {question}
    Standalone question:"""


def get_qa_prompt_by_mode(mode: str, initial_prompt: Optional[str]) -> str:
    qa_prompts = {
        "assistant": initial_prompt,
        "pair_programmer": """You are a helpful AI programmer. you will be given the content of git repository and your should answer questions about the code in the given context.
    You must answer with code when asked to write one, and you must answer with a markdown file when asked to write one, if the question is not about the code in the context, answer with "I only answer questions about the code in the given context".
    
    {context}
    
    Question: {question}
    Helpful answer in markdown:""",
    }

    if mode in qa_prompts:
        return qa_prompts[mode]

    return initial_prompt if initial_prompt else ""


def getConversationRetrievalChain(
    vector_store: VectorStore,
    mode,
    initial_prompt: str,
    bot_id: str,
    app: Optional[str],
):
    llm = get_llm()
    # template = get_qa_prompt_by_mode(mode, initial_prompt=initial_prompt)
    prompts_templates = load_prompts(app)

    custom_knowlege_base_system_prompt = None
    if app and prompts_templates:
        custom_knowlege_base_system_prompt = (
            prompts_templates.knowledge_base_system_prompt
        )

    template = (
        custom_knowlege_base_system_prompt
        or """ Given the conversation history and question below, provide a concise answer based on the relevant documents, If you don't know the answer, say that you don't know the answer, don't make one up:

        Conversation History:
        {chat_history} 

        Question: {question}

        Context:
        {context}

        Concise Answer:
    """
    )
    prompt = PromptTemplate.from_template(template)
    chain = ConversationalRetrievalChain.from_llm(
        llm,
        chain_type="stuff",
        retriever=vector_store.as_retriever(
            search_kwargs={"filter": {"bot_id": bot_id}}
        ),
        verbose=True,
        combine_docs_chain_kwargs={"prompt": prompt},
    )
    return chain


def log_user_request(text: str) -> None:
    logging.info("[OpenCopilot] Got the following user request: {}".format(text))


def check_required_fields(
    base_prompt: str, text: str, swagger_url: Optional[str]
) -> None:
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
    else:
        return ResolvingParser(spec_string=swagger_doc)


def handle_existing_workflow(
    document: Document,  # lagnchaing
    text: str,
    headers: Dict[str, Any],
    server_base_url: str,
    swagger_url: Optional[str],
    app: Optional[str],
    swagger_doc: ResolvingParser,
    session_id: str,
    bot_id: str,
) -> ResponseDict:
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

    return output


def handle_api_calls(
    ids: List[str],
    swagger_doc: ResolvingParser,
    text: str,
    headers: Dict[str, Any],
    server_base_url: str,
    swagger_url: Optional[str],
    app: Optional[str],
    session_id: str,
    bot_id: str,
) -> ResponseDict:
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

    return output


def handle_no_api_call(bot_message: str) -> ResponseDict:
    return {"response": bot_message, "error": ""}


def handle_exception(e: Exception, event: str) -> ResponseDict:
    struct_log.exception(payload={}, error=str(e), event="/handle_request")
    return {"response": str(e), "error": "An error occured in handle request"}
