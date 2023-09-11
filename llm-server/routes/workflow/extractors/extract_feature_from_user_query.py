from langchain.tools.json.tool import JsonSpec
from langchain.llms.openai import OpenAI
import os
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain import PromptTemplate

openai_api_key = os.getenv("OPENAI_API_KEY")

llm = OpenAI(openai_api_key=openai_api_key)

# This fits a chat model better
def extract_feature_from_user_query(user_input: str):
    _DEFAULT_TEMPLATE = """You will receive user input, and I need you to extract all pertinent features from it. \n\nUser Input: {input} \n Assistant: """

    _DEFAULT_TEMPLATE.format(input=input)
    PROMPT = PromptTemplate(
        input_variables=["input"], template=_DEFAULT_TEMPLATE
    )
    
    PROMPT.format(input=user_input)
    chain = LLMChain(
        llm=llm,
        prompt=PROMPT,
        verbose=True
    )
    response = chain.run({"input": user_input})
    return response
