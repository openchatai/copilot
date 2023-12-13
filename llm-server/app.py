from dotenv import load_dotenv
from flask import Flask
from flask_socketio import SocketIO
from routes._swagger.controller import _swagger
from routes.chat.chat_controller import chat_workflow, send_chat
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow
from routes.prompt.prompt_controller import prompt_workflow
from routes.prompt.prompt_template_controller import prompt_template_workflow
from routes.uploads.upload_controller import upload_controller
from routes.workflow.workflow_controller import workflow
from utils.config import Config
from utils.vector_store_setup import init_qdrant_collections
from shared.models.opencopilot_db import create_database_schema
from flask import jsonify
from utils.db import Database
from utils.get_logger import CustomLogger
from flask_socketio import emit
import asyncio

logger = CustomLogger(module_name=__name__)


db_instance = Database()
mongo = db_instance.get_db()

load_dotenv()

create_database_schema()

app = Flask(__name__)
socketio = SocketIO(app)
app.url_map.strict_slashes = False
app.register_blueprint(
    workflow, url_prefix="/backend/flows"
)  # todo delete this one once the new flows are ready
app.register_blueprint(flow, url_prefix="/backend/flows-new")
app.register_blueprint(_swagger, url_prefix="/backend/swagger_api")
app.register_blueprint(chat_workflow, url_prefix="/backend/chat")
app.register_blueprint(copilot, url_prefix="/backend/copilot")
app.register_blueprint(upload_controller, url_prefix="/backend/uploads")
app.register_blueprint(datasource_workflow, url_prefix="/backend/data_sources")
app.register_blueprint(prompt_template_workflow, url_prefix="/backend/prompt-templates")
app.register_blueprint(prompt_workflow, url_prefix="/backend/prompts")


app.config.from_object(Config)


@app.route("/healthcheck")
def health_check():
    info = mongo.client
    # c_info = celery.connection()

    # print(c_info)
    return jsonify(
        status="OK", servers={"mongo": info.options.pool_options.max_pool_size}
    )


init_qdrant_collections()


@socketio.on("send_chat")
def handle_message(data):
    logger.info("received some json data", data=data)
    asyncio.run(send_chat(data))


if __name__ == "__main__":
    socketio.run(
        app, host="0.0.0.0", port=8002, debug=True, use_reloader=True, log_output=True
    )
