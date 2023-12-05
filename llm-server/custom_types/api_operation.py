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

    def __str__(self):
        return (
            f"ApiOperation_vs(\n"
            f"  description={self.description},\n"
            f"  method={self.method},\n"
            f"  operation_id={self.operation_id},\n"
            f"  path={self.path},\n"
            f"  summary={self.summary},\n"
            f"  x_codegen_request_body_name={self.x_codegen_request_body_name}\n)"
        )
        
# Modify __str__ to handle lists
def list_to_str(lst):
    return "[" + ",\n".join(str(item) for item in lst) + "]"

# Add the list_to_str function to the __str__ method
ApiOperation_vs.__str__ = lambda self: list_to_str([self])