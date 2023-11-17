from typing import Optional, Literal, Dict

class StoreOptions:
    ALLOWED_NAMESPACES = Literal["swagger", "knowledgebase"]

    def __init__(self, namespace: ALLOWED_NAMESPACES, metadata: Dict[str, str] = {}):
        self.namespace = namespace
        self.metadata = metadata