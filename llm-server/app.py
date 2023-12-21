import asyncio
from dotenv import load_dotenv
from flask import Flask
from flask import jsonify

from routes.action.action_controller import action
from routes.chat.chat_controller import chat_workflow, send_chat_stream
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow
from routes.prompt.prompt_controller import prompt_workflow
from routes.prompt.prompt_template_controller import prompt_template_workflow
from routes.uploads.upload_controller import upload_controller
from shared.models.opencopilot_db import create_database_schema
from utils.config import Config
from utils.db import NoSQLDatabase
from routes.chat.chat_dto import ChatInput

from flask_socketio import SocketIO

from utils.vector_store_setup import init_qdrant_collections
db_instance = NoSQLDatabase()
mongo = db_instance.get_db()

load_dotenv()

create_database_schema()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

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


@app.route("/healthcheck")
def health_check():
    info = mongo.client
    return jsonify(status="OK", servers={"mongo": info.options.pool_options.max_pool_size})


@socketio.on('send_chat')
def handle_send_chat(json_data):
    input_data = ChatInput(**json_data)
    message = input_data.content
    session_id = input_data.session_id
    headers_from_json = input_data.headers

    bot_token = headers_from_json.get("X-Bot-Token")

    if not message or len(message) > 255:
        socketio.emit('error_response', {'error': 'Invalid content, the size is larger than 255 char'})
        return

    if not bot_token:
        socketio.emit('error_response', {'error': 'Bot token is required'})
        return

    send_chat_stream(message, bot_token, session_id, headers_from_json)
    

init_qdrant_collections()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
