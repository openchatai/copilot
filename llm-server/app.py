import asyncio
from dotenv import load_dotenv
from werkzeug.exceptions import MethodNotAllowed, HTTPException, NotFound
from flask import Flask, render_template, request
from flask import jsonify
from flask_jwt_extended import JWTManager
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
from shared.models.opencopilot_db import create_database_schema

from utils.config import Config
from routes.chat.chat_dto import ChatInput

from flask_socketio import SocketIO
from utils.get_logger import SilentException
from routes.search.search_controller import search_workflow

from flask_cors import CORS
from shared.models.opencopilot_db.database_setup import engine
from sqlalchemy.orm import sessionmaker
from utils.llm_consts import JWT_SECRET_KEY
import sentry_sdk

sentry_sdk.init(traces_sample_rate=1.0, profiles_sample_rate=1.0)

SessionLocal = sessionmaker(bind=engine)

load_dotenv()

create_database_schema()
app = Flask(__name__)

# @Todo only allow for cloud and porter [for later]
CORS(app)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY  # Change this to a random secret key
JWTManager(app)
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
# app.register_blueprint(transformers_workflow, url_prefix="/backend/transformers")
app.register_blueprint(search_workflow, url_prefix="/backend/search")

app.config.from_object(Config)
socketio = SocketIO(app, cors_allowed_origins="*")


@app.errorhandler(HTTPException)
def handle_http_exception(error):
    # Log the error or perform any other necessary actions
    SilentException.capture_exception(error)
    return jsonify({"error": error.name, "message": error.description}), error.code


@app.errorhandler(NotFound)
def handle_not_found(error):
    SilentException.capture_exception(error)
    return (
        jsonify(
            {
                "error": "Not Found",
                "message": "The requested URL was not found on the server.",
            }
        ),
        404,
    )


@app.errorhandler(Exception)
def handle_exception(error):
    SilentException.capture_exception(error)
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
    user_message = ChatInput(**json_data)
    message = user_message.content
    session_id = user_message.session_id
    headers_from_json = user_message.headers
    bot_token = user_message.bot_token
    extra_params = user_message.extra_params or {}
    incoming_message_id = (
        user_message.id or None
    )  # incoming message (assigned by the client)

    json_data = {
        "url": request.base_url,
        "path": "/socketio/",
        "query_params": "{}",
        "path_params": "{}",
        "method": "wss",
    }

    asyncio.run(
        send_chat_stream(
            message,
            bot_token,
            session_id,
            headers_from_json,
            extra_params,
            incoming_message_id,
        )
    )
    log_opensource_telemetry_data(json_data)


init_qdrant_collections()

if __name__ == "__main__":
    socketio.run(
        app, host="0.0.0.0", port=8002, debug=True, use_reloader=True, log_output=True
    )
