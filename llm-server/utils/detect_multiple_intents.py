import json
import logging
import re
from typing import Any, Dict, Optional
from typing import List

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils.get_llm import get_llm


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
    # todo use create_structured_output_chain with validation
    summaries = getSummaries(swagger_doc)
    _DEFAULT_TEMPLATE = """You are an AI chatbot that determines the sequence of API calls needed to perform an action. You only provide the user with the list of API calls. You have been given a summary of the APIs that a third party system allows access to. However, users may also ask general questions that do not require API calls. 

When given:

- A list of API summaries `{summaries}`
- The user's desired action `{user_requirement}`

Respond with the following JSON structure:

{{
  "ids": [
    "list",
    "of",
    "operation",
    "ids"
  ],
  "bot_message": "Bot reasoning here" 
}}


IT'S EXTREMELY IMPORTANT TO ONLY RETURN THE OPERATION IDS REQUIRE TO GET THE JOB DONE, NEVER ADD THINGS THAT IS NOT REQUIRED.

Only return the JSON structure, no additional text or formatting, just JSON.
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
    response = json.loads(chain.run(
        {
            "summaries": summaries,
            "user_requirement": user_requirement,
        }
    ))

    formatted_response = json.dumps(response, indent=4)  # Indent the JSON with 4 spaces

    logging.info("[OpenCopilot] Extracted the needed steps to get the job done: {}".format(formatted_response))

    if len(response["ids"]) == 1:
        logging.info("[OpenCopilot] The user request can be done in a single API")
        return True
    elif len(response["ids"]) > 1:
        logging.info("[OpenCopilot] The user request require multiple API calls to be done")
        return False
    else:
        return response["bot_message"]
