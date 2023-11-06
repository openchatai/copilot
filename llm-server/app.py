import logging

from flask import Flask, request, jsonify, Response
from routes.workflow.workflow_controller import workflow
from routes.uploads.upload_controller import upload_controller
from routes._swagger.controller import _swagger
from routes.chat.chat_controller import chat_workflow
from typing import Any, Tuple
from utils.config import Config
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from opencopilot_db import create_database_schema

create_database_schema()

logging.basicConfig(level=logging.INFO)


app = Flask(__name__)
CORS(app, resources={r"/uploads/*": {"origins": "http://127.0.0.1:8081"}})


# completely disable cors for saas, we need to enable this on nginx dynamically for every partner that registers on the app
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:8081"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


app.register_blueprint(workflow, url_prefix="/workflow")
app.register_blueprint(_swagger, url_prefix="/swagger_api")
app.register_blueprint(chat_workflow, url_prefix="/chat")
app.register_blueprint(upload_controller, url_prefix="/uploads")


app.config.from_object(Config)
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
