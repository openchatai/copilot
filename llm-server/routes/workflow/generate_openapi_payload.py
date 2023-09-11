# %%
from langchain.tools.json.tool import JsonSpec
import re, os, json
from dotenv import load_dotenv
from langchain.llms.openai import OpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain import PromptTemplate

from langchain.memory import VectorStoreRetrieverMemory
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.vectorstores import Qdrant, VectorStore
import qdrant_client
from qdrant_client.models import Distance, VectorParams
from routes.workflow.load_openapi_spec import load_openapi_spec

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
            paths = ref['$ref'].split("/")[1:3]
            last_portion_list.append(json_spec[paths[0]][paths[1]])
        
        if '$ref' in ref["schema"]:
            paths = ref['schema']['$ref'].split("/")[1:3]
            last_portion_list.append(json_spec[paths[0]][paths[1]])
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

def generate_openapi_payload(spec_source, text: str, _operation_id: str):
    spec_dict = load_openapi_spec(spec_source)

    # Continue with the rest of the code
    json_spec = JsonSpec(dict_=spec_dict, max_value_length=4000)

    api_operation, method, path = get_api_operation_by_id(json_spec, _operation_id)
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
    # vector_store: VectorStore = Qdrant(client, collection_name=temp_coll, embeddings=embeddings)
    past_api_responses = ""

    # memory = VectorStoreRetrieverMemory(retriever=retriever)

    _DEFAULT_TEMPLATE = """You are a highly skilled AI software engineer with expertise in OpenAPI Swagger. You will be provided with the following essential components: access to our historical API calls, a user query, and a relevant excerpt from the OpenAPI Swagger documentation to construct the correct API payload. Enclose the JSON payload within three backticks on both sides. Use 'query_param' to signify query parameters, 'body' to indicate the request body, and 'route_parameter' for route parameters. If a required parameter is missing, please substitute it with a mock value.

    Historical API Responses:
    {api_call_responses}

    User Input:
    User Query: {input}
    The API payload is: """

    PROMPT = PromptTemplate(
        input_variables=["api_call_responses", "input"], template=_DEFAULT_TEMPLATE
    )
    conversation_with_summary = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True
    )
    json_string = conversation_with_summary.predict(api_call_responses=past_api_responses, input=f"""{text}, the openapi schema is {isolated_request}
    """)

    response = extract_json_payload(json_string)
    # vector_store.add_texts([json_string])
    past_api_responses = f"{past_api_responses} \n ${json_string}"
    print(past_api_responses)

    response["path"] = path
    response["request_type"] = method
    return response
    
