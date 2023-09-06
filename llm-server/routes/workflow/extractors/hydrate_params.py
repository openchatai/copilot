def hydrateParams(json_spec: dict, ref_list: dict):
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


def replace_ref_with_value(input_dict, json_spec_dict):
    def replace_ref_recursive(sub_dict):
        if isinstance(sub_dict, dict):
            if '$ref' in sub_dict:
                ref_value = sub_dict['$ref']
                split_ref = ref_value.split('/')
                if len(split_ref) > 3:
                    replacement_key = '/'.join(split_ref[1:])
                    replacement_value = get_nested_value(json_spec_dict, replacement_key)
                    if replacement_value is not None:
                        sub_dict.clear()
                        sub_dict.update(replacement_value)
            else:
                for key, value in sub_dict.items():
                    replace_ref_recursive(value)
    
    def get_nested_value(d, key):
        keys = key.split('/')
        for k in keys:
            if k in d:
                d = d[k]
            else:
                return None
        return d

    replace_ref_recursive(input_dict)

# Define the input dictionary
# input_dict = {
#     'id': {'type': 'integer', 'format': 'int64', 'example': 10},
#     'name': {'type': 'string', 'example': 'doggie'},
#     'category': {'$ref': '#/components/schemas/Category'},
#     'photoUrls': {'type': 'array', 'xml': {...}, 'items': {...}},
#     'tags': {'type': 'array', 'xml': {...}, 'items': {...}},
#     'status': {'type': 'string', 'description': 'pet status in the store', 'enum': [...]}
# }

# # Define somedict
# somedict = {
#     "components": {
#         "schemas": {
#             "Category": {
#                 "type": "object",
#                 "properties": {
#                     "name": {"type": "string"}
#                 }
#             }
#         }
#     }
# }

# # Call the function to replace $ref values
# replace_ref_with_somedict(input_dict, somedict)

# # Resulting updated input_dict
# print(input_dict)
