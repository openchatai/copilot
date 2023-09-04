from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.requests import TextRequestsWrapper
from langchain.tools.json.tool import JsonSpec
import json, yaml
from dotenv import load_dotenv
import re
from langchain.llms.openai import OpenAI
import os
from langchain.memory import VectorStoreRetrieverMemory
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.docstore import InMemoryDocstore
from langchain.embeddings.openai import OpenAIEmbeddings
import qdrant_client
from uuid import uuid4
from qdrant_client.models import Distance, VectorParams
from langchain.prompts import PromptTemplate

from langchain.chains import ConversationChain
from abc import ABC, abstractmethod

load_dotenv()

import qdrant_client
# Define the default prompt template
_DEFAULT_TEMPLATE = """You are an assistant helping me build an HTTP request. You will be given the following pieces of information: Access to our past conversation, a user query, and an excerpt from OpenAPI Swagger for generating the correct response. Your response MUST be a valid JSON. Use 'query_param' key to denote query parameters, 'body' key to denote the body, and 'route_parameter' to denote route parameters. Wrap the JSON inside three backticks.

Previous conversations:
{history}

(You do not need to use these pieces of information if not relevant)

Human Input:
Human: {input}
The API payload is: """

# Define the prompt template
PROMPT = PromptTemplate(input_variables=["history", "input"], template=_DEFAULT_TEMPLATE)

# Define the function to hydrate parameters
def hydrate_params(json_spec, ref_list):
    last_portion_list = []
    
    for ref in ref_list:
        if '$ref' in ref:  # Check if '$ref' exists in the dictionary
            match = re.search(r'/([^/]+)$', ref['$ref'])
            if match:
                last_portion_list.append(json_spec["components"]["parameters"][match.group(1)])
        else:
            # If '$ref' doesn't exist, add the reference as is
            last_portion_list.append(ref)
    
    return last_portion_list

# Define the function to extract JSON payload
def extract_json_payload(input_string):
    try:
        # Find the start and end positions of the JSON payload
        start_index = input_string.find('```json') + len('```json')
        end_index = input_string.rfind('```')

        # Extract the JSON payload
        json_payload = input_string[start_index:end_index]

        # Parse the JSON payload
        parsed_json = json.loads(json_payload)
        return parsed_json
    except json.JSONDecodeError as e:
        return None, f"Error parsing JSON: {e}"

def read_openapi_spec(openapi_file):
    """Read and parse the OpenAPI specification from a YAML or JSON file."""
    with open(openapi_file) as f:
        if openapi_file.endswith('.json'):
            data = json.load(f)
        elif openapi_file.endswith('.yaml') or openapi_file.endswith('.yml'):
            data = yaml.load(f, Loader=yaml.FullLoader)
        else:
            raise ValueError("Unsupported file format. Please provide a YAML or JSON file.")
    return data

def resolve_refs(input_dict, json_spec):
    def resolve_reference(reference):
        if not reference.startswith("#/components"):
            # Return reference as is if it's not in the expected format
            return reference

        parts = reference.split('/')
        current = json_spec
        for part in parts[2:]:  # Skip the initial '#' and 'components' parts
            current = current.get(part, {})
            if not current:
                # If any part of the reference is missing, return an empty dictionary
                return {}
        return current

    def resolve_nested_dict(input_dict):
        if not isinstance(input_dict, dict):
            return input_dict

        resolved_dict = {}
        for key, value in input_dict.items():
            if isinstance(value, dict):
                resolved_dict[key] = resolve_nested_dict(value)
            elif isinstance(value, list):
                resolved_dict[key] = [resolve_nested_dict(item) for item in value]
            elif key == '$ref':
                resolved_value = resolve_reference(value)
                if isinstance(resolved_value, dict):
                    # If the resolved value is a dictionary, recursively resolve it
                    resolved_dict[key] = resolve_nested_dict(resolved_value)
                else:
                    resolved_dict[key] = resolved_value
            else:
                resolved_dict[key] = value
        return resolved_dict

    return resolve_nested_dict(input_dict)


def process_api_operation(method, api_operation, json_spec):    
    request_body = api_operation.get("requestBody")
    
    if not isinstance(request_body, dict):
        return api_operation  # Return the request_schema if it's not a dictionary
    
    if "application/json" in request_body.get("content", {}):
        request_body = request_body["content"]["application/json"]["schema"]
        request_body = resolve_refs(request_body, json_spec.dict_)
        api_operation["request_body"] = request_body
    else:
        api_operation["request_body"] = {}  # No request body defined
    
    return api_operation

def create_conversation_chain():
    """Create a ConversationChain object with the necessary components."""
    openai_api_key = os.getenv("OPENAI_API_KEY")
    llm = OpenAI(openai_api_key=openai_api_key)

    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    client = qdrant_client.QdrantClient(url="http://localhost:6333", prefer_grpc=True)
    temp_coll = "second_coll"
    client.delete_collection(temp_coll)  # Just for testing or maybe even for prod!!!
    client.create_collection(temp_coll, vectors_config=VectorParams(size=1536, distance=Distance.COSINE))
    vector_store = Qdrant(client, collection_name=temp_coll, embeddings=embeddings)
    retriever = vector_store.as_retriever()
    memory = VectorStoreRetrieverMemory(retriever=retriever)

    return ConversationChain(llm=llm, prompt=PROMPT, memory=memory, verbose=True)

def get_api_operation_by_id(json_spec, s_operation_id):
    paths = json_spec.dict_.get("paths", {})
    
    for path, methods in paths.items():
        for method, operation in methods.items():
            if isinstance(operation, dict):
                operation_id = operation.get("operationId")
                
                if operation_id == s_operation_id:
                    return operation, method
    
    # If the operation with the specified ID is not found, return None
    return None, None

def generate_openapi_payload(openapi_file, user_action):
    """Generate a JSON payload using the OpenAPI specification and user action."""
    data = read_openapi_spec(openapi_file)

    json_spec = JsonSpec(dict_=data, max_value_length=4000)
    api_operation, method = get_api_operation_by_id(json_spec, "check-users-saved-albums")
    isolated_request = process_api_operation(method, api_operation, json_spec)

    if isolated_request and "parameters" in isolated_request:
        isolated_request["parameters"] = hydrate_params(json_spec.dict_, isolated_request["parameters"])

    # Combine the user action with the OpenAPI schema
    user_input = f"User input: {user_action}, the OpenAPI schema is {isolated_request}"

    conversation_with_summary = create_conversation_chain()

    json_string = conversation_with_summary.predict(input=user_input)

    response = extract_json_payload(json_string)

    payload = {
        "body": response.get("body", {}),
        "parameters": response.get("parameters", []),
        "query_params": response.get("query_param", {}),
        "method": method
    }

    return payload


# command line usage
# r = generate_openapi_payload('../notebooks/openapi.yaml', 'add album 889234ssdfa')
# print(r)