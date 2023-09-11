from typing import Dict, Any, List, Union


def hydrateParams(
    json_spec: Dict[str, Any],
    ref_list: List[Dict[str, Any]],
) -> List[Union[Dict[str, Any], None]]:
    last_portion_list: List[Union[Dict[str, Any], None]] = []

    for ref in ref_list:
        if "$ref" in ref:
            paths = ref["$ref"].split("/")[1:3]
            if paths[0] in json_spec and paths[1] in json_spec[paths[0]]:
                last_portion_list.append(json_spec[paths[0]][paths[1]])
            else:
                last_portion_list.append(None)

        if "schema" in ref and "$ref" in ref["schema"]:
            paths = ref["schema"]["$ref"].split("/")[1:3]
            if paths[0] in json_spec and paths[1] in json_spec[paths[0]]:
                last_portion_list.append(json_spec[paths[0]][paths[1]])
            else:
                last_portion_list.append(None)
        else:
            last_portion_list.append(ref)

    return last_portion_list


# recursively replace all $ref in json object
def replace_ref_with_value(
    input_dict: Dict[str, Any], json_spec_dict: Dict[str, Any]
) -> None:
    def replace_ref_recursive(sub_dict: Dict[str, Any]) -> None:
        if isinstance(sub_dict, dict):
            if "$ref" in sub_dict:
                ref_value: str = sub_dict["$ref"]
                split_ref: List[str] = ref_value.split("/")
                if len(split_ref) > 3:
                    replacement_key: str = "/".join(split_ref[1:])
                    replacement_value: Any = get_nested_value(
                        json_spec_dict, replacement_key
                    )
                    if replacement_value is not None:
                        sub_dict.clear()
                        sub_dict.update(replacement_value)
            else:
                for _, value in sub_dict.items():
                    replace_ref_recursive(value)

    def get_nested_value(d: Dict[str, Any], key: str) -> Any:
        keys = key.split("/")
        for k in keys:
            if k in d:
                d = d[k]
            else:
                return None
        return d

    replace_ref_recursive(input_dict)
