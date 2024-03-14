import os
from utils.llm_consts import S3_BUCKET_NAME
import boto3
import tempfile

def determine_file_storage_path(file_name):
    storage_type = os.getenv(
        "STORAGE_TYPE", "local"
    )  # Default to local storage if not specified
    if storage_type == "s3":
        if not S3_BUCKET_NAME:
            raise ValueError("S3_BUCKET_NAME environment variable is not set.")
        file_path = f"s3://{S3_BUCKET_NAME}/{file_name}"
        is_s3 = True
    else:
        # Local storage
        shared_folder = os.getenv("SHARED_FOLDER", "path/to/your/shared/folder")
        file_path = os.path.join(shared_folder, file_name)
        is_s3 = False
    return file_path, is_s3


def download_s3_file(bucket_name, s3_key):
    s3 = boto3.client("s3")
    with tempfile.NamedTemporaryFile(delete=False) as temp_file:
        s3.download_file(bucket_name, s3_key, temp_file.name)
        return temp_file.name
    
    
# used for reading swagger files from _swagger directory
def read_local_file(filepath: str):
    try:
        with open(filepath, 'r') as f:
            return f.read()
    except IOError:
        return "Unable to read file"

    
