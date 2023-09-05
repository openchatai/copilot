# %%
from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.requests import TextRequestsWrapper
from langchain.tools.json.tool import JsonSpec
import json, yaml
from dotenv import load_dotenv
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import ConversationChain
from langchain.llms import OpenAI
from langchain import PromptTemplate, LLMChain

from langchain.memory import VectorStoreRetrieverMemory
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.docstore import InMemoryDocstore
from langchain.embeddings.openai import OpenAIEmbeddings
import qdrant_client
from uuid import uuid4
from qdrant_client.models import Distance, VectorParams
import requests

import os
import re

load_dotenv()

# %%
def get_api_operation_by_id(json_spec, s_operation_id):
    paths = json_spec.dict_.get("paths", {})
    for path, methods in paths.items():
        for method, operation in methods.items():
            # Check if 'operation' is a dictionary
            if isinstance(operation, dict):
                operation_id = operation.get("operationId")
                
                if operation_id == s_operation_id:
                    return operation, method, path
            else:
                # Handle the case where 'operation' is not a dictionary
                # print(f"Skipping invalid operation: {operation}")
                pass


# %%
def resolve_refs(input_dict, json_spec):
    # Check if the input_dict is a dictionary and contains a '$ref' key
    if isinstance(input_dict, dict) and '$ref' in input_dict:
        ref_value = input_dict['$ref']
        
        # Use regular expression to extract the schema name
        match = re.match(r'#/components/schemas/(\w+)', ref_value)
        if match:
            schema_name = match.group(1)
            
            # Try to find the corresponding schema in the json_spec dictionary
            schema = json_spec.dict_.get("components", {}).get("schemas", {}).get(schema_name)
            
            # If a matching schema is found, replace the '$ref' key with the schema
            if schema:
                return schema
        
    # Recursively process nested dictionaries and lists
    if isinstance(input_dict, dict):
        for key, value in input_dict.items():
            input_dict[key] = resolve_refs(value, json_spec)
    elif isinstance(input_dict, list):
        for i, item in enumerate(input_dict):
            input_dict[i] = resolve_refs(item, json_spec)
    
    return input_dict



def hydrateParams(json_spec, ref_list):
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

# %%
def process_api_operation(method, api_operation, json_spec):    
    request_body = api_operation.get("requestBody")
    
    if not isinstance(request_body, dict):
        return api_operation  # Return the request_schema if it's not a dictionary
    
    request_body = request_body["content"]["application/json"]["schema"]
    request_body = resolve_refs(request_body, json_spec.dict_)
    api_operation["request_body"] = request_body
    return api_operation

def extract_json_payload(input_string):
    # Remove all whitespace characters
    input_string = re.sub(r'\s', '', input_string)
    
    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)
    return json.loads(match[0]) if match else None

def generate_openapi_payload(spec_source, text: str):
    if isinstance(spec_source, str):
        if spec_source.startswith("http://") or spec_source.startswith("https://"):
            # Fetch the OpenAPI spec from a URL
            response = requests.get(spec_source)
            if response.status_code == 200:
                content_type = response.headers.get("content-type", "").lower()
                if "json" in content_type:
                    spec_dict = json.loads(response.text)
                elif "yaml" in content_type:
                    spec_dict = yaml.load(response.text, Loader=yaml.FullLoader)
                    
                elif "text/plain" in content_type:
                    spec_dict = yaml.load(response.text, Loader=yaml.FullLoader)
                else:
                    raise Exception(f"Unsupported content type in response: {content_type}")
            else:
                raise Exception(f"Failed to fetch OpenAPI spec from URL: {spec_source}")
        else:
            # Assume it's a file path and try to load it
            try:
                with open(spec_source, "r") as file:
                    spec_dict = yaml.load(file, Loader=yaml.FullLoader)
            except Exception as e:
                raise Exception(f"Failed to load OpenAPI spec from file: {spec_source}. Error: {e}")
    elif isinstance(spec_source, dict):
        # Use the provided dictionary as the spec
        spec_dict = spec_source
    else:
        raise ValueError("Unsupported spec_source type. It should be a URL, file path, or dictionary.")

    # Continue with the rest of the code
    json_spec = JsonSpec(dict_=spec_dict, max_value_length=4000)

    api_operation, method, path = get_api_operation_by_id(json_spec, "check-users-saved-albums")
    isolated_request = process_api_operation(method, api_operation, json_spec)

    if isolated_request and "parameters" in isolated_request:
        isolated_request["parameters"] = hydrateParams(json_spec.dict_, isolated_request["parameters"])

    openai_api_key = os.getenv("OPENAI_API_KEY")

    llm = OpenAI(openai_api_key=openai_api_key)

    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    client = qdrant_client.QdrantClient(url="http://localhost:6333", prefer_grpc=True)
    temp_coll = "second_coll"
    client.delete_collection(temp_coll)  # just for testing or maybe even for prod!!!
    client.create_collection(temp_coll, vectors_config=VectorParams(size=1536, distance=Distance.COSINE))
    vector_store = Qdrant(client, collection_name=temp_coll, embeddings=embeddings)

    retriever = vector_store.as_retriever()
    memory = VectorStoreRetrieverMemory(retriever=retriever)

    _DEFAULT_TEMPLATE = """You are an assistant helping me build http requests. You will be given the following pieces of information. Access to our past conversation. A user query and an excerpt from openapi swagger for generating the correct api payload.  Wrap the json inside three backticks on both sides, use query_param key to denote query parameter. Use body key to denote the body and route_parameter to denote the route params. query_params for query parameters

    Previous conversations:
    {history}

    (You do not need to use these pieces of information if not relevant)

    Human Input:
    Human: {input}
    The API payload is: """

    PROMPT = PromptTemplate(
        input_variables=["history", "input"], template=_DEFAULT_TEMPLATE
    )
    conversation_with_summary = ConversationChain(
        llm=llm,
        prompt=PROMPT,
        memory=memory,
        verbose=True
    )
    json_string = conversation_with_summary.predict(input=f"""{text}, the openapi schema is {isolated_request}
    """)

    print(json_string)
    response = extract_json_payload(json_string)
    print(response)
    vector_store.add_texts([json_string])

    response["path"] = path
    response["request_type"] = method
    return response
    
