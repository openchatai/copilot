from flask import Blueprint, Response

from utils.db import Database

db_instance = Database()
mongo = db_instance.get_db()

flow = Blueprint("flow", __name__)


@flow.route("/", methods=["GET"])
def get_all_flows_by_bot_id(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def get_flow_by_id(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def get_flow_variables(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def add_variables_to_flow(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def add_action_to_flow(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def remove_action_from_flow(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def add_action_to_flow_from_defined_one(session_id: str) -> Response:
    pass


@flow.route("/", methods=["GET"])
def update_action_in_flow(session_id: str) -> Response:
    pass
