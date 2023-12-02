from dotenv import load_dotenv
from flask import Flask
from opencopilot_db import create_database_schema

from routes._swagger.controller import _swagger
from routes.chat.chat_controller import chat_workflow
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow
from routes.prompt.prompt_controller import prompt_workflow
from routes.prompt.prompt_template_controller import prompt_template_workflow
from routes.uploads.upload_controller import upload_controller
from routes.workflow.workflow_controller import workflow
from utils.config import Config
from utils.vector_store_setup import init_qdrant_collections

load_dotenv()

create_database_schema()

app = Flask(__name__)
app.url_map.strict_slashes = False
app.register_blueprint(workflow, url_prefix="/backend/flows-old")
app.register_blueprint(_swagger, url_prefix="/backend/swagger_api")
app.register_blueprint(chat_workflow, url_prefix="/backend/chat")
app.register_blueprint(copilot, url_prefix="/backend/copilot")
app.register_blueprint(upload_controller, url_prefix="/backend/uploads")
app.register_blueprint(datasource_workflow, url_prefix="/backend/data_sources")
app.register_blueprint(prompt_template_workflow, url_prefix="/backend/prompt-templates")
app.register_blueprint(prompt_workflow, url_prefix="/backend/prompts")
app.register_blueprint(flow, url_prefix="/backend/flows")  # todo rename

app.config.from_object(Config)

init_qdrant_collections()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
