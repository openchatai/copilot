from flask import Flask, request, jsonify, Response
from models.repository.chat_history_repo import create_chat_history
from routes.workflow.workflow_controller import workflow
from routes.copilot.copilot_controller import copilot
from routes.uploads.upload_controller import upload_controller
from routes._swagger.controller import _swagger
from routes.chat.chat_controller import chat_workflow
from utils.config import Config
from utils.get_logger import struct_log
from routes.data_source.data_source_controller import datasource_workflow
from dotenv import load_dotenv

from utils.vector_store_setup import init_qdrant_collections

load_dotenv()
from opencopilot_db import create_database_schema

create_database_schema()

app = Flask(__name__)
app.url_map.strict_slashes = False
app.register_blueprint(workflow, url_prefix="/backend/flows")
app.register_blueprint(_swagger, url_prefix="/backend/swagger_api")
app.register_blueprint(chat_workflow, url_prefix="/backend/chat")
app.register_blueprint(copilot, url_prefix="/backend/copilot")
app.register_blueprint(upload_controller, url_prefix="/backend/uploads")
app.register_blueprint(datasource_workflow, url_prefix="/backend/data_sources")

app.config.from_object(Config)
from routes.root_service import extract_data, handle_request

init_qdrant_collections()


@app.route("/handle", methods=["POST", "OPTIONS"])
def handle() -> Response:
    data = request.get_json()
    try:
        response = handle_request(data)
        create_chat_history(data["bot_id"], data["session_id"], True, data["text"])
        create_chat_history(
            data["bot_id"],
            data["session_id"],
            False,
            response["response"] or response["error"],
        )
        return jsonify(response)
    except Exception as e:
        struct_log.exception(
            app="OPENCOPILOT", payload=data, error=str(e), event="/handle"
        )
        return jsonify({"response": "Something went wrong, check the logs!!"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
