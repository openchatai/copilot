from typing import Optional, Dict


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
