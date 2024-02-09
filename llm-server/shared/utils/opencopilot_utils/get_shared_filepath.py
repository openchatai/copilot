import os
from utils.llm_consts import SHARED_FOLDER


def get_file_path(filename):
    # Construct the full file path based on the UPLOAD_FOLDER and filename
    file_path = os.path.join(SHARED_FOLDER, filename)

    # Check if the file exists
    if os.path.exists(file_path):
        return file_path
    else:
        raise FileNotFoundError(f"File '{filename}' not found in {file_path}.")
