import re

from routes.workflow.generate_openapi_payload import (
    load_openapi_spec,
)
from routes.workflow.typings.run_workflow_input import WorkflowData
from langchain.tools.json.tool import JsonSpec
from typing import List

from typing import Any, Dict, Optional, cast, Union
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from utils.get_llm import get_llm

from routes.workflow.generate_openapi_payload import extract_json_payload


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


def getSummaries(spec_source: str):
    """Get API endpoint summaries from an OpenAPI spec."""

    summaries: List[str] = []

    # Load the OpenAPI spec
    spec_dict: Optional[Dict[str, Any]] = load_openapi_spec(spec_source)
    if not spec_dict:
        raise ValueError("Unable to load OpenAPI spec")

    json_spec: JsonSpec = JsonSpec(dict_=spec_dict, max_value_length=4000)

    # Get the paths and iterate over them
    paths: Optional[Dict[str, Any]] = json_spec.dict_.get("paths")
    if not paths:
        raise ValueError("OpenAPI spec missing 'paths'")

    for path in paths:
        operation = paths[path]
        for field in operation:
            if "summary" in operation[field]:
                summaries.append(operation[field]["summary"])

    return summaries


def hasSingleIntent(spec_source: str, user_requirement: str) -> bool:
    # The output of this function can also be used to find out the workflow by using the following query,
    # and then filtering it based on vector search
    # db.workflows.find( { 'flows.steps.open_api_operation_id': { $all: [ "findPetsByStatus", "placeOrder" ] } } )
    summaries = getSummaries(spec_source)
    _DEFAULT_TEMPLATE = """
    User: Here is a list of API summaries: 

    {summaries}

    Given the user requirement below, Respond a json with the following keys:

    "number_of_apis_required": int, "apis_in_order": [str]

    User requirement:  

    {user_requirement}
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

    j = extract_json_payload(response)
    print(f"{j}")
    if j and j["number_of_apis_required"] == 1:
        return True
    else:
        return False
