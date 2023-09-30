import re

from routes.workflow.typings.run_workflow_input import WorkflowData
from langchain.tools.json.tool import JsonSpec
from typing import List

from typing import Any, Dict, Optional, cast, Union
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils.get_llm import get_llm
import json


# use spaCy or BERT for more accurate results
def hasMultipleIntents(user_input: str) -> bool:
    # Keywords for multiple questions
    question_keywords = [
        "and",
        "also",
        "in addition",
        "moreover",
        "furthermore",
        "besides",
        "additionally",
        "another question",
        "second question",
        "next, ask",
        "thirdly",
        "finally",
        "lastly",
    ]

    # Check for question keywords
    question_pattern = "|".join(re.escape(keyword) for keyword in question_keywords)
    question_matches = [
        match.group()
        for match in re.finditer(question_pattern, user_input, re.IGNORECASE)
    ]

    print(f"Found {question_matches} in the following input: {user_input}")
    return bool(question_matches)


# user_input = (
#     "I want to fetch data from API A and also, can you answer another question?"
# )
# result = hasMultipleIntents(user_input)
# print(json.dumps(result, indent=2))


def getSummaries(swagger_doc: Any):
    """Get API endpoint summaries from an OpenAPI spec."""

    summaries: List[str] = []

    # Get the paths and iterate over them
    paths: Optional[Dict[str, Any]] = swagger_doc.get("paths")
    if not paths:
        raise ValueError("OpenAPI spec missing 'paths'")

    for path in paths:
        operation = paths[path]
        for field in operation:
            if "summary" in operation[field]:
                summaries.append(
                    f"""{operation[field]["operationId"]} - {operation[field]["description"]}"""
                )

    return summaries


def hasSingleIntent(swagger_doc: Any, user_requirement: str) -> bool:
    summaries = getSummaries(swagger_doc)
    _DEFAULT_TEMPLATE = """
        You are an AI chatbot equipped with the capability to interact with APIs on behalf of users. However, users may also ask you general questions that do not necessitate API calls.

        **User Input:**
        ```
        User: Here is a list of API summaries:
        {summaries}

        If the request can be completed with a single API call, please reply with "__ONE__". If it requires multiple API calls, respond with "__MULTIPLE__". If the query is a general question and does not require an API call, provide the answer to the question.

        User Requirement:
        {user_requirement} \n
        
        **Chatbot Response:**
    """
    llm = get_llm()
    PROMPT = PromptTemplate(
        input_variables=["summaries", "user_requirement"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(user_requirement=user_requirement, summaries="\n".join(summaries))

    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        # memory=memory,
        verbose=True,
    )
    response = chain.run(
        {"summaries": "\n".join(summaries), "user_requirement": user_requirement}
    )

    print(f"Summary call response: {response}")

    if "__ONE__" in response.upper():
        return True
    elif "__MULTIPLE__" in response.upper():
        return False
    else:
        return response
