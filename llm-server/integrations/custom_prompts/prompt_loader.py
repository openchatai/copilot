import importlib
from typing import Optional


class PromptsClass:
    _instances = {}

    def __new__(cls, app_name: str):
        if app_name not in cls._instances:
            instance = super().__new__(cls)
            instance._init_instance(app_name)
            cls._instances[app_name] = instance
        return cls._instances[app_name]

    def _init_instance(self, app_name: str):
        prompts = importlib.import_module(f"integrations.custom_prompts.{app_name}")
        self.knowledge_base_system_prompt = getattr(
            prompts, "knowledge_base_system_prompt"
        )
        self.system_message_classifier = getattr(prompts, "system_message_classifier")
        self.api_summarizer = getattr(prompts, "api_summarizer")
        self.api_generation_prompt = getattr(prompts, "api_generation_prompt")


def load_prompts(app_name) -> Optional[PromptsClass]:
    if not app_name:
        return None
    return PromptsClass(app_name)
