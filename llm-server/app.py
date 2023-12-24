from dotenv import load_dotenv
from flask import Flask
from flask import jsonify

from routes.action.action_controller import action
from routes.chat.chat_controller import chat_workflow
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow
from routes.prompt.prompt_controller import prompt_workflow
from routes.prompt.prompt_template_controller import prompt_template_workflow
from routes.uploads.upload_controller import upload_controller
from shared.models.opencopilot_db import create_database_schema
from utils.config import Config
from utils.db import NoSQLDatabase
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)

from utils.vector_store_setup import init_qdrant_collections
db_instance = NoSQLDatabase()
mongo = db_instance.get_db()

load_dotenv()

create_database_schema()

app = Flask(__name__)
app.url_map.strict_slashes = False
app.register_blueprint(flow, url_prefix="/backend/flows")
app.register_blueprint(chat_workflow, url_prefix="/backend/chat")
app.register_blueprint(copilot, url_prefix="/backend/copilot")
app.register_blueprint(upload_controller, url_prefix="/backend/uploads")
app.register_blueprint(datasource_workflow, url_prefix="/backend/data_sources")
app.register_blueprint(prompt_template_workflow, url_prefix="/backend/prompt-templates")
app.register_blueprint(prompt_workflow, url_prefix="/backend/prompts")
app.register_blueprint(action, url_prefix="/backend/actions")

app.config.from_object(Config)

@app.errorhandler(Exception)
def internal_server_error(error):
    # Log the error or perform any other necessary actions
    logger.error(f"Internal Server Error: {str(error)}")
    return jsonify({'error': 'Internal Server Error', 'message': 'An unexpected error occurred on the server.'}), 500

@app.route("/healthcheck")
def health_check():
    info = mongo.client
    return jsonify(status="OK", servers={"mongo": info.options.pool_options.max_pool_size})


init_qdrant_collections()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
