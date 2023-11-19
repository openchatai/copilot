# copilot_controller.py
import os
import uuid

import requests
from flask import Blueprint, jsonify, render_template, request
from models.chatbot import Chatbot  # Adjust this import as necessary
from werkzeug.utils import secure_filename

from workers.shared.utils.opencopilot_utils.get_shared_filepath import UPLOAD_FOLDER

copilot_workflow = Blueprint('copilot', __name__)


@copilot_workflow.route('/copilots', methods=['GET'])
def index():
    chatbots = Chatbot.query.all()  # Fetch all chatbots, adjust query as needed

    return jsonify([chatbot.to_dict() for chatbot in chatbots])  # Convert chatbots to dictionaries if needed

