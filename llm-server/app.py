import json

import requests
import warnings
from flask import Flask, request
from langchain.chains.openai_functions import create_structured_output_chain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.utilities.openapi import OpenAPISpec

from api_caller.base import try_to_match_and_call_api_endpoint
from models.models import AiResponseFormat
from prompts.base import non_api_base_prompt, api_base_prompt
from flask_pymongo import PyMongo
import os
from routes.workflow.workflow_controller import workflow
from utils.fetch_swagger_spec import fetch_swagger_spec

app = Flask(__name__)
app.config['MONGO_URI'] = os.getenv('MONGODB_URL', 'mongodb://localhost:27017/opencopilot')
mongo = PyMongo(app)

app.register_blueprint(workflow, url_prefix="/workflow")

## TODO: Implement caching for the swagger file content (no need to load it everytime)
@app.route('/handle', methods=['POST', 'OPTIONS'])
def handle():
    data = request.get_json()
    text = data.get('text')
    swagger_url = data.get('swagger_url')
    base_prompt = data.get('base_prompt')
    headers = data.get('headers', {})

    if not text:
        return json.dumps({"error": "text is required"}), 400

    if not base_prompt:
        return json.dumps({"error": "base_prompt is required"}), 400
    
    swagger_spec = fetch_swagger_spec(swagger_url)

    try:
        json_output = try_to_match_and_call_api_endpoint(swagger_spec, text, headers)
    except Exception as e:
        warnings.warn(str(e))
        json_output = None

    llm = ChatOpenAI(model="gpt-3.5-turbo-0613", temperature=0)

    if json_output is None:
        prompt_msgs = non_api_base_prompt(base_prompt, text)

    else:
        prompt_msgs = api_base_prompt(base_prompt, text, json_output)

    prompt = ChatPromptTemplate(messages=prompt_msgs)
    chain = create_structured_output_chain(AiResponseFormat, llm, prompt, verbose=False)
    chain_output = chain.run(question=text)

    return json.loads(json.dumps(chain_output.dict())), 200


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8002)
