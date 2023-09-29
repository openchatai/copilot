from typing import Dict


class WorkflowData:
    def __init__(
        self,
        text: str,
        headers: Dict[str, str],
        server_base_url: str,
    ) -> None:
        self.text = text
        self.headers = headers
        self.server_base_url = server_base_url
