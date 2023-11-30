class ApiOperation_vs:
    def __init__(
        self,
        description,
        method,
        operation_id,
        path,
        summary,
        x_codegen_request_body_name,
    ):
        self.description = description
        self.method = method
        self.operation_id = operation_id
        self.path = path
        self.summary = summary
        self.x_codegen_request_body_name = x_codegen_request_body_name
