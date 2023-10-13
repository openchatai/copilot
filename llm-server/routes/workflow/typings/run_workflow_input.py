from typing import Dict, Optional


# This is the api payload and doesnot represent workflow schema, use WorkflowDataType from opencopilot types for that
class WorkflowData:
    def __init__(
        self,
        text: str,
        headers: Dict[str, str],
        server_base_url: str,
        swagger_url: str,
        state_id: Optional[str],
    ) -> None:
        self.text = text
        self.headers = headers
        self.server_base_url = server_base_url
        self.swagger_url = swagger_url
        self.state_id = state_id
