import re

from routes.workflow.typings.run_workflow_input import WorkflowData
from langchain.tools.json.tool import JsonSpec
from typing import Any, List, Optional, cast, Union
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils.get_llm import get_llm
from prance import ResolvingParser
from routes.workflow.extractors.extract_json import extract_json_payload


class APIResponse:
    def __init__(self, ids: List[str], bot_message: str) -> None:
        self.ids = ids
        self.bot_message = bot_message


def get_summaries(_swagger_doc: str) -> str:
    swagger_doc = ResolvingParser(spec_string=_swagger_doc)
    servers = ", ".join(
        [s["url"] for s in swagger_doc.specification.get("servers", [])]
    )
    summaries_str = "servers:" + servers + "\n"
    paths = swagger_doc.specification.get("paths")
    for path in paths:
        operations = paths[path]
        for method in operations:
            operation = operations[method]
            try:
                summary = f"- {operation['operationId']} - {operation['summary']}\n"
                if "requestBody" in operation:
                    content_types = operation["requestBody"]["content"]
                    if "application/json" in content_types:
                        schema = content_types["application/json"]["schema"]
                        if "properties" in schema:
                            params = schema["properties"].keys()
                        elif "items" in schema:
                            params = schema["items"]["properties"].keys()
                    elif "application/octet-stream" in content_types:
                        params = ["binary data"]
                    summary += f"  - Body Parameters: {', '.join(params)}\n"
                summary += f"  - Method: {method}\n"
                if "parameters" in operation:
                    params = [p["name"] for p in operation["parameters"]]
                    summary += f"  - Parameters: {', '.join(params)}\n"
                summaries_str += summary + "\n"
            except:
                pass
    return summaries_str


# prompts were tested on claude, gpt-3 and gpt-4
def get_api_plan(swagger_doc: Any, user_requirement: str) -> APIResponse:
    summaries = get_summaries(swagger_doc)
    _DEFAULT_TEMPLATE = """You are an AI chatbot that determines the sequence of API calls needed to perform an action. You only provide the user with the list of API calls. You have been given a summary of the APIs that a third party system allows access to. However, users may also ask general questions that do not require API calls. 

When given:

- A list of API summaries `{summaries}`
- The user's desired action `{user_requirement}`

Respond with the following JSON structure:

```json
{{
  "ids": [
    "list",
    "of",
    "operation",
    "ids"
  ],
  "bot_message": "Bot reasoning here" 
}}
```

Only return the JSON structure, no additional text.
"""
    llm = get_llm()
    PROMPT = PromptTemplate(
        input_variables=["summaries", "user_requirement"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(user_requirement=user_requirement, summaries=summaries)

    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True,
    )
    response = extract_json_payload(
        chain.run(
            {
                "summaries": summaries,
                "user_requirement": user_requirement,
            }
        )
    )

    print(f"Summary call response: {response}")
    return APIResponse(ids=response["ids"], bot_message=response["bot_message"])
