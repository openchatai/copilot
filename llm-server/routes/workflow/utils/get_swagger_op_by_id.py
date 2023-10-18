from typing import Dict, Any


def get_operation_by_id(swagger_spec: Dict[str, Any], op_id_key: str) -> Dict[str, Any]:
    operation_lookup = {}

    for path in swagger_spec["paths"]:
        for method in swagger_spec["paths"][path]:
            operation = swagger_spec["paths"][path][method]
            operation_id = operation["operationId"]
            operation_lookup[operation_id] = {
                "name": operation.get("name"),
                "description": operation.get("description"),
            }

    return operation_lookup[op_id_key]
