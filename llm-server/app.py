import asyncio
import requests
from dotenv import load_dotenv
from flask import Flask, request
from flask import jsonify
from utils.vector_store_setup import init_qdrant_collections
import traceback
from routes.action.action_controller import action
from routes.chat.chat_controller import chat_workflow, send_chat_stream
from routes.copilot.copilot_controller import copilot
from routes.data_source.data_source_controller import datasource_workflow
from routes.flow.flow_controller import flow
from routes.typing.powerup_controller import powerup
from routes.api_call.api_call_controller import api_call_controller
from shared.utils.opencopilot_utils.telemetry import (
    log_api_call,
    log_opensource_telemetry_data,
)

from routes.uploads.upload_controller import upload_controller

# from shared.models.opencopilot_db import create_database_schema
from shared.models.opencopilot_db.database_setup import create_database_schema
from utils.config import Config
from routes.chat.chat_dto import ChatInput
from werkzeug.exceptions import HTTPException

from flask_socketio import SocketIO
from utils.get_logger import CustomLogger
from routes.search.search_controller import search_workflow

from flask_cors import CORS
from shared.models.opencopilot_db.database_setup import engine
from sqlalchemy.orm import sessionmaker

SessionLocal = sessionmaker(bind=engine)

logger = CustomLogger(__name__)

load_dotenv()

create_database_schema()
app = Flask(__name__)
# CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

app.after_request(log_api_call)

app.url_map.strict_slashes = False
app.register_blueprint(flow, url_prefix="/backend/flows")
app.register_blueprint(chat_workflow, url_prefix="/backend/chat")
app.register_blueprint(copilot, url_prefix="/backend/copilot")
app.register_blueprint(upload_controller, url_prefix="/backend/uploads")
app.register_blueprint(api_call_controller, url_prefix="/backend/api_calls")
app.register_blueprint(datasource_workflow, url_prefix="/backend/data_sources")
app.register_blueprint(action, url_prefix="/backend/actions")
app.register_blueprint(powerup, url_prefix="/backend/powerup")
app.register_blueprint(search_workflow, url_prefix="/backend/search")

app.config.from_object(Config)


@app.errorhandler(Exception)
def handle_exception(error):
    # If the exception is an HTTPException (includes 4XX and 5XX errors)
    if isinstance(error, HTTPException):
        # Log the error or perform any other necessary actions
        logger.error("HTTP Error", error=error)
        return jsonify({"error": error.name, "message": error.description}), error.code

    traceback.print_exc()
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
    # headers = request.headers
    bot_token = input_data.bot_token
    # bot_token = headers.environ.get("HTTP_X_BOT_TOKEN")

    json_data = {
        "url": request.base_url,
        "path": "/socketio/",
        "query_params": "{}",
        "path_params": "{}",
        "method": "wss",
    }

    # if not bot_token:
    #     socketio.emit(session_id, {"error": "Bot token is required"})
    #     return

    asyncio.run(send_chat_stream(message, bot_token, session_id, headers_from_json))
    log_opensource_telemetry_data(json_data)


init_qdrant_collections()

if __name__ == "__main__":
    socketio.run(
        app, host="0.0.0.0", port=8002, debug=True, use_reloader=True, log_output=False
    )
