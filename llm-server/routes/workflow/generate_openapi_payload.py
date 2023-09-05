# %%
from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.requests import TextRequestsWrapper
from langchain.tools.json.tool import JsonSpec
import json, yaml
from dotenv import load_dotenv

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
                    return operation, method
            else:
                # Handle the case where 'operation' is not a dictionary
                # print(f"Skipping invalid operation: {operation}")
                pass


# %%
import re

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

import re

# ref_list -> [{'$ref': '#/components/parameters/QueryAlbumIds'},
#  {'$ref': '#/components/parameters/QueryMarket'}]

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

# %%
with open("/Users/shanurrahman/Documents/openchat_all/OpenCopilot/llm-server/notebooks/openapi.yaml") as f:
    data = yaml.load(f, Loader=yaml.FullLoader)
json_spec = JsonSpec(dict_=data, max_value_length=4000)

api_operation, method=get_api_operation_by_id(json_spec, "check-users-saved-albums")
isolated_request = process_api_operation(method, api_operation, json_spec)

if isolated_request and "parameters" in isolated_request:
    isolated_request["parameters"] = hydrateParams(json_spec.dict_, isolated_request["parameters"])


# %%
from langchain.llms.openai import OpenAI
import os

openai_api_key = os.getenv("OPENAI_API_KEY")

llm = OpenAI(openai_api_key=openai_api_key)
from langchain.llms import OpenAI
from langchain import PromptTemplate, LLMChain

# %%
from langchain.memory import VectorStoreRetrieverMemory
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant
from langchain.docstore import InMemoryDocstore
from langchain.embeddings.openai import OpenAIEmbeddings
import qdrant_client
from uuid import uuid4
from qdrant_client.models import Distance, VectorParams

embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
client = qdrant_client.QdrantClient(url="http://localhost:6333", prefer_grpc=True)
temp_coll = "second_coll"
client.delete_collection(temp_coll) # just for testing or maybe even for prod!!!
client.create_collection(temp_coll, vectors_config=VectorParams(size=1536, distance=Distance.COSINE))
vector_store = Qdrant(client, collection_name=temp_coll, embeddings=embeddings)


# Create the VectorStoreRetrieverMemory
retriever = vector_store.as_retriever()
memory = VectorStoreRetrieverMemory(retriever=retriever)

# %%
from langchain.prompts import PromptTemplate

from langchain.chains import ConversationChain

_DEFAULT_TEMPLATE = """You are an assistant helping me build a http requests. You will be given the following pieces of information. Access to our past conversation. A user query and an excerpt from openapi swagger for generating the correct response. Your response MUST be a valid json, use query_param key to denote query parameter. Use body key to denote the body and route_parameter to denote the route params. Wrap the json inside three backticks

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
json_string = conversation_with_summary.predict(input=f"""I want to add album 889234ssdfa, the openapi schema is {isolated_request}
""")


# %%

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

# %%
json_string

response = extract_json_payload(json_string)
vector_store.add_texts([json_string])

print(response)
