# %%
from langchain.tools.json.tool import JsonSpec
import re, os, json
from dotenv import load_dotenv
from langchain.llms.openai import OpenAI
from routes.workflow.load_openapi_spec import load_openapi_spec
from routes.workflow.extractors.extract_body import extractBodyFromSchema
from routes.workflow.extractors.extract_param import extractParamsFromSchema
from routes.workflow.extractors.extract_feature_from_user_query import extract_feature_from_user_query

load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = OpenAI(openai_api_key=openai_api_key)


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
        paths = ref_value.split("/")[1:3]
        if paths[0] in json_spec and paths[1] in json_spec[paths[0]]:
            return json_spec[paths[0]][paths[1]]
        
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
            if paths[0] in json_spec and paths[1] in json_spec[paths[0]]:
                last_portion_list.append(json_spec[paths[0]][paths[1]])
            else:
                # Handle the case where the key is not present
                last_portion_list.append(None)
        
        if 'schema' in ref and '$ref' in ref["schema"]:
            paths = ref['schema']['$ref'].split("/")[1:3]
            if paths[0] in json_spec and paths[1] in json_spec[paths[0]]:
                last_portion_list.append(json_spec[paths[0]][paths[1]])
            else:
                # Handle the case where the key is not present
                last_portion_list.append(None)
        else:
            # If '$ref' doesn't exist, add the reference as is
            last_portion_list.append(ref)

    return last_portion_list

# %% Need to convert this to recursive function because body params also reference codebase
def process_api_operation(method, api_operation, json_spec):    
    content_type = "application/json"
    requestBody = api_operation.get("requestBody")
    
    if not isinstance(requestBody, dict):
        return api_operation  # Return the request_schema if it's not a dictionary
    
    content_types = requestBody["content"]
    
    # Check if the specified content type exists in the requestBody
    if content_type in content_types:
        content_type_schema = content_types[content_type]["schema"]
        
        # Check if the content type schema is a reference
        if "$ref" in content_type_schema:
            ref_path = content_type_schema["$ref"].split("/")[1:]
            
            # Navigate through the JSON spec using the reference path
            schema_node = json_spec.dict_
            for path_element in ref_path:
                schema_node = schema_node[path_element]
            
            # Update the content type schema with the resolved schema
            content_types[content_type]["schema"] = schema_node
    
    # remove other content types except application/json
    # api_operation["requestBody"]["content"] = {content_type: schema_node}
    # del api_operation["responses"]
    # del api_operation["security"]
    # del api_operation["tags"]
    # del api_operation["summary"]
    # del api_operation["description"]
    return api_operation

def extract_json_payload(input_string):
    # Remove all whitespace characters
    input_string = re.sub(r'\s', '', input_string)
    
    match = re.findall(r"{.+[:,].+}|\[.+[,:].+\]", input_string)
    return json.loads(match[0]) if match else None

def generate_openapi_payload(spec_source, text: str, _operation_id: str, api_response_cache: str):
    spec_dict = load_openapi_spec(spec_source)
    extracted_feature = extract_feature_from_user_query(text)
    
    # Continue with the rest of the code
    json_spec = JsonSpec(dict_=spec_dict, max_value_length=4000)

    api_operation, method, path = get_api_operation_by_id(json_spec, _operation_id)
    isolated_request = process_api_operation(method, api_operation, json_spec)

    if isolated_request and "parameters" in isolated_request:
        isolated_request["parameters"] = hydrateParams(json_spec.dict_, isolated_request["parameters"])
        params = extractParamsFromSchema(isolated_request["parameters"], extracted_feature, api_response_cache);
    
    body = extractBodyFromSchema(api_operation, extracted_feature, api_response_cache)
    
    response = {"body": body, params: params}
    
    api_response_cache = f"{api_response_cache} \n ${json.dumps(response)}"
    print(f"cache:: {path}::{api_response_cache}")

    response["path"] = path
    response["request_type"] = method
    
