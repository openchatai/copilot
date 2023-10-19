from typing import Dict, Any
from prance import ResolvingParser


def get_operation_by_id(
    swagger_spec: ResolvingParser, op_id_key: str
) -> Dict[str, Any]:
    operation_lookup = {}

    for path in swagger_spec.specification["paths"]:
        for method in swagger_spec.specification["paths"][path]:
            operation = swagger_spec.specification["paths"][path][method]
            operation_id = operation["operationId"]
            operation_lookup[operation_id] = {
                "name": operation.get("name"),
                "description": operation.get("description"),
            }

    return operation_lookup[op_id_key]
