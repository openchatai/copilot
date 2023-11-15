import logging
from flask import Flask, request, jsonify, Response
from dotenv import load_dotenv

load_dotenv()
from opencopilot_utils import ENV_CONFIGS

logging.error(f"This is env:::: ENV_CONFIGS.MYSQL_URI: {ENV_CONFIGS.MYSQL_URI}")

from routes.workflow.workflow_controller import workflow
from routes.uploads.upload_controller import upload_controller
from routes._swagger.controller import _swagger
from routes.chat.chat_controller import chat_workflow
from typing import Any, Tuple
from flask_cors import CORS
from routes.data_source.data_source_controller import datasource_workflow

from opencopilot_db import create_database_schema


create_database_schema()
logging.basicConfig(level=logging.INFO)


app = Flask(__name__)
app.register_blueprint(workflow, url_prefix="/workflow")
app.register_blueprint(_swagger, url_prefix="/swagger_api")
app.register_blueprint(chat_workflow, url_prefix="/chat")
app.register_blueprint(upload_controller, url_prefix="/uploads")
app.register_blueprint(datasource_workflow, url_prefix="/data_sources")

from routes.root_service import handle_request


## TODO: Implement caching for the swagger file content (no need to load it everytime)
@app.route("/handle", methods=["POST", "OPTIONS"])
def handle() -> Response:
    data = request.get_json()
    try:
        response = handle_request(data)
        return jsonify(response)
    except Exception as e:
        return jsonify({"response": str(e)})


@app.errorhandler(500)
def internal_server_error(error: Any) -> Tuple[str, int]:
    # Log the error to the console
    print(error)
    return "Internal Server Error", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8002, debug=True)
