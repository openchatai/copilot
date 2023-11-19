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


@copilot_workflow.route('/copilot/swagger', methods=['POST'])
def handle_swagger_file():
    if 'swagger_file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['swagger_file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    if file:  # Add your file validation logic here if needed
        filename = secure_filename(str(uuid.uuid4()) + ".json")
        file.save(os.path.join(UPLOAD_FOLDER, filename))

        # Create Chatbot instance and save to DB (adjust as per your application logic)
        chatbot = Chatbot(name=request.form.get('name'),
                          swagger_url=filename,
                          prompt_message=request.form.get('prompt_message'),
                          website=request.form.get('website'))
        # Add your DB commit logic here

        result = swagger_service.save_swaggerfile_to_mongo(filename, chatbot.id)

        return jsonify({
            'file_name': filename,
            'chatbot': chatbot.to_dict()  # Convert chatbot to dictionary
        })


@copilot_workflow.route('/copilot/<id>', methods=['GET'])
def general_settings(id):
    bot = Chatbot.query.filter_by(id=id).first_or_404()

    return jsonify({
        'chatbot': bot.to_dict()  # Convert chatbot to dictionary
    })



