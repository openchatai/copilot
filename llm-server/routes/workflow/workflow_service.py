from bson import ObjectId
from utils.db import Database
from utils.vector_db.get_vector_store import get_vector_store
from utils.vector_db.store_options import StoreOptions
from routes.workflow.openapi_agent import run_openapi_agent_from_json
from utils.fetch_swagger_spec import fetch_swagger_spec
from routes.workflow.generate_openapi_payload import generate_openapi_payload
from utils.make_api_call import make_api_request
from langchain.utilities.openapi import OpenAPISpec
import json

db_instance = Database()
mongo = db_instance.get_db()

def run_workflow(data):
    text = data.get('text')
    swagger_src = data.get('swagger_src')
    base_prompt = data.get('base_prompt')
    headers = data.get('headers', {})
    namespace = "workflows"  # This will come from request payload later on when implementing multi-tenancy
    server_base_url = data.get('server_base_url')

    if not text:
        return json.dumps({"error": "text is required"}), 400

    vector_store = get_vector_store(StoreOptions(namespace))
    documents = vector_store.similarity_search(text)

    first_document_id = ObjectId(documents[0].metadata["workflow_id"]) if documents else None
    record = mongo.workflows.find_one({"_id": first_document_id})

    result = run_openapi_operations(record, swagger_src, text, headers, server_base_url)
    return result, 200, {'Content-Type': 'application/json'}

def run_openapi_operations(record, swagger_src, text, headers, server_base_url):
    record_info = {"Workflow Name": record.get('name')}
    api_response_cache = ""
    for flow in record.get("flows", []):
        for step in flow.get("steps"):
            operation_id = step.get("open_api_operation_id")
            api_payload = generate_openapi_payload(swagger_src, text, operation_id, api_response_cache)
            # api_payload = generate_openapi_payload()
            
            api_payload["path"] = f"{server_base_url}{api_payload['path']}"
            api_response = make_api_request(
                request_type = api_payload["request_type"],
                url = api_payload["path"],
                body=api_payload["body"],
                params=api_payload["route_parameter"],
                query_params=api_payload["query_param"],
                headers=headers,
            )
            # response = run_openapi_agent_from_json(spec_json=swagger_spec, prompt=text, prev_api_response)
            # Take this operation id and the data provided in the request to call the API with the given open_api_operation_id
            # The store the response of that API to call the next API, we have to think about how this response gets stored
            record_info[operation_id] = api_response  # Store the response for this operation_id
            prev_api_response = api_response
            
            
    api_response_cache = ""
    return json.dumps(record_info)
