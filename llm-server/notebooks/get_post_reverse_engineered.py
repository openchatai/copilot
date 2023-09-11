# %%
from langchain.agents import create_openapi_agent
from langchain.agents.agent_toolkits import OpenAPIToolkit
from langchain.llms.openai import OpenAI
from langchain.requests import TextRequestsWrapper
from langchain.tools.json.tool import JsonSpec

import json, yaml

# %%
with open("openapi.yaml") as f:
    data = yaml.load(f, Loader=yaml.FullLoader)
json_spec = JsonSpec(dict_=data, max_value_length=4000)

# %%
def get_api_operation_by_id(json_spec, operation_id):
    paths = json_spec.dict_.get("paths", {})
    for path, methods in paths.items():
        for method, operation in methods.items():
            if operation.get("operationId") == operation_id:
                return operation, method

    # If the operation ID is not found, return None
    return None


# %%
api_operation, method=get_api_operation_by_id(json_spec, "get-multiple-albums")

# %%
print(api_operation, method)

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

# %%
def process_operation(method, api_operation, json_spec):
    if method == "get":
        return api_operation
    else:
        input_dict = api_operation["requestBody"]["content"]["application/json"]["schema"]
        json_spec = resolve_refs(json_spec.dict_)
        result = resolve_refs(input_dict, json_spec)
        return result

# %%
isolated_request = process_operation(method, api_operation, json_spec)

# %%
isolated_request

# %%
isolated_request["parameters"]

# %%
import re

# ref_list -> [{'$ref': '#/components/parameters/QueryAlbumIds'},
#  {'$ref': '#/components/parameters/QueryMarket'}]

def hydrateParams(json_spec, ref_list):
    last_portion_list = []
    
    for ref in ref_list:
        match = re.search(r'/([^/]+)$', ref['$ref'])
        if match:
            last_portion_list.append(json_spec["components"]["parameters"][match.group(1)])
    
    return last_portion_list

# %%
isolated_request["parameters"] = hydrateParams(json_spec.dict_, isolated_request["parameters"])

# %%
isolated_request

# %%



