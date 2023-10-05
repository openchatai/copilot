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
    
    _DEFAULT_TEMPLATE = """We have the following information required for executing the next API call.\n
    The initial input at the onset of the process: `{text}`\n
    The responses obtained from previous API calls: ```{prev_resp}```
    Swagger Schema defining parameters: ```{param_schema}```
    Output musts be a json object representing the query params and nothing else. Also query params should only have keys defined in the swagger schema ignore anything else, moreover if user instruction doesnot have information about a query parameter ignore that as well. 
    
    Query params: """

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
