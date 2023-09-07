import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from utils.get_llm import get_llm

openai_api_key = os.getenv("OPENAI_API_KEY")

llm = get_llm()


# This fits a chat model better
def extract_feature_from_user_query(user_input: str) -> str:
    _DEFAULT_TEMPLATE = """You will receive user input, and I need you to extract all pertinent features from it. \n\nUser Input: {input} \n Assistant: """

    _DEFAULT_TEMPLATE.format(input=input)
    PROMPT = PromptTemplate(input_variables=["input"], template=_DEFAULT_TEMPLATE)

    PROMPT.format(input=user_input)
    chain = LLMChain(llm=llm, prompt=PROMPT, verbose=True)
    response = chain.run({"input": user_input})
    return response
