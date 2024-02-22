from typing import Optional, Any


class ApiInfo:
    def __init__(
        self,
        endpoint: Optional[str],
        method: Optional[str],
        path_params: Any,
        query_params: Any,
        body_schema: Any,
    ) -> None:
        self.endpoint = endpoint
        self.method = method
        self.path_params: Any = path_params
        self.query_params: Any = query_params
        self.body_schema = body_schema
