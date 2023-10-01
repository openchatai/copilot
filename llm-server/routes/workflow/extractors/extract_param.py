import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from routes.workflow.extractors.extract_json import extract_json_payload
from utils.get_llm import get_llm
from custom_types.t_json import JsonData
from typing import Optional

openai_api_key = os.getenv("OPENAI_API_KEY")
llm = get_llm()


def gen_params_from_schema(
    param_schema: str, text: str, prev_resp: str
) -> Optional[JsonData]:
    """Extracts API parameters from a schema based on user text and previous response.

    Args:
        param_schema (JsonData): A snippet of the OpenAPI parameter schema relevant to this operation.
        text (str): The original user text query.
        prev_resp (str): The previous API response.

    Returns:
        Optional[JsonData]: The extracted JSON parameters, if successful.

    This function constructs a prompt with the given inputs and passes it to
    an LLM to generate a JSON string containing the parameters. It then parses
    this to extract a JSON payload matching the schema structure.
    """

    _DEFAULT_TEMPLATE = """In order to facilitate the sequential execution of a highly intelligent language model with a series of APIs, we furnish the vital information required for executing the next API call.

    The initial input at the onset of the process: `{text}`
    The responses obtained from previous API calls: `{prev_resp}`
    A schema for request parameters that defines the expected format: `{param_schema}`

    The JSON payload, which is used to represent the query parameters and is constructed using the initial input and previous API responses, must be enclosed within triple backticks on both sides. It must strictly adhere to the specified "type/format" guidelines laid out in the schema, and the structure is as follows:"""

    PROMPT = PromptTemplate(
        input_variables=["prev_resp", "text", "param_schema"],
        template=_DEFAULT_TEMPLATE,
    )

    PROMPT.format(
        prev_resp=prev_resp,
        text=text,
        param_schema=param_schema,
    )

    chain = LLMChain(llm=llm, prompt=PROMPT, verbose=True)
    json_string = chain.run(
        {
            "param_schema": param_schema,
            "text": text,
            "prev_resp": prev_resp,
        }
    )

    response = extract_json_payload(json_string)
    print(f"Query params: {response}")
    return response
