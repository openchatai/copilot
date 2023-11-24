import json
import os
import uuid
import routes._swagger.service as swagger_service

from flask import Blueprint, jsonify, request
from opencopilot_db.chatbot import Chatbot
from sqlalchemy.exc import SQLAlchemyError
from werkzeug.utils import secure_filename
from utils.swagger_parser import SwaggerParser

copilot = Blueprint('copilot', __name__)

UPLOAD_FOLDER = ''


@copilot.route('/copilots', methods=['GET'])
def index():
    chatbots = Chatbot.query.all()

    return jsonify([chatbot.to_dict() for chatbot in chatbots])


@copilot.route('/copilot/swagger', methods=['POST'])
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

        result = swagger_service.save_swaggerfile_to_mongo(filename, chatbot.id)

        return jsonify({
            'file_name': filename,
            'chatbot': chatbot.to_dict()  # Convert chatbot to dictionary
        })


@copilot.route('/copilot/<id>', methods=['GET'])
def general_settings(copilot_id):
    bot = Chatbot.query.filter_by(id=copilot_id).first_or_404()

    return jsonify({
        'chatbot': bot.to_dict()  # Convert chatbot to dictionary
    })


@copilot.route('/copilot/<id>', methods=['DELETE'])
def delete_bot(copilot_id):
    bot = Chatbot.query.filter_by(id=copilot_id).first_or_404()
    bot.delete()

    return jsonify({
        'success': 'chatbot_deleted'
    })


@copilot.route('/copilot/<id>', methods=['POST', 'PATCH', 'PUT'])
def general_settings_update(copilot_id):
    bot = Chatbot.query.filter_by(id=copilot_id).first_or_404()

    data = request.json
    if 'name' not in data or data['name'].strip() == '':
        return jsonify({'error': 'Name is required'}), 400

    bot.name = data['name']
    bot.prompt_message = data.get('prompt_message', 'AI_COPILOT_INITIAL_PROMPT')  # @todo Adjust default value as needed

    try:
        bot.save()
    except SQLAlchemyError as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({'chatbot': bot.to_dict()})  # Convert chatbot to dictionary


@copilot.route('/copilot/<id>/validator', methods=['GET'])
def validator(copilot_id):
    bot = Chatbot.query.filter_by(id=copilot_id).first_or_404()

    try:
        swagger_url = bot.swagger_url  # Adjust attribute name as necessary
        swagger_content = ""

        if not swagger_url.startswith("https"):
            # Read the file content from the local system or shared storage
            with open(swagger_url, 'r') as file:
                swagger_content = file.read()

        swagger_data = json.loads(swagger_content)
        parser = SwaggerParser(swagger_data)

    except Exception as e:
        return jsonify({'error': 'invalid_swagger_file'}), 400

    endpoints = parser.get_endpoints()
    validations = parser.get_validations(endpoints)
    return jsonify({
        'chatbot_id': bot.id,
        'all_endpoints': endpoints,
        'validations': validations
    })
