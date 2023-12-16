from typing import Optional, Dict


# This is the api payload and does not represent workflow schema, use WorkflowDataType from opencopilot types for that
class ChatContext:
    def __init__(
            self,
            text: str,
            headers: Dict[str, str],
            app: Optional[str],
    ) -> None:
        self.text = text
        self.headers = headers
        self.app = app  # example trello
