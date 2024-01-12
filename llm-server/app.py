import asyncio
from dotenv import load_dotenv
from flask import Flask, request
from flask import jsonify
from utils.vector_store_setup import init_qdrant_collections

from routes.action.action_controller import action
from routes.chat.chat_controller import chat_workflow, send_chat_stream
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow

from routes.uploads.upload_controller import upload_controller
from shared.models.opencopilot_db import create_database_schema
from utils.config import Config
from routes.chat.chat_dto import ChatInput

from flask_socketio import SocketIO
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)

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
app.register_blueprint(action, url_prefix="/backend/actions")

app.config.from_object(Config)


@app.errorhandler(Exception)
def internal_server_error(error):
    # Log the error or perform any other necessary actions
    logger.error("Internal Server Error", error=error)
    return (
        jsonify(
            {
                "error": "Internal Server Error",
                "message": "An unexpected error occurred on the server.",
            }
        ),
        500,
    )


@socketio.on("send_chat")
def handle_send_chat(json_data):
    input_data = ChatInput(**json_data)
    message = input_data.content
    session_id = input_data.session_id
    headers_from_json = input_data.headers

    headers = request.headers

    bot_token = headers.environ.get("HTTP_X_BOT_TOKEN")

    if not message or len(message) > 255:
        socketio.emit(
            session_id, {"error": "Invalid content, the size is larger than 255 char"}
        )
        return

    if not bot_token:
        socketio.emit(session_id, {"error": "Bot token is required"})
        return

    asyncio.run(send_chat_stream(message, bot_token, session_id, headers_from_json))


init_qdrant_collections()

if __name__ == "__main__":
    socketio.run(
        app, host="0.0.0.0", port=8002, debug=True, use_reloader=True, log_output=False
    )
