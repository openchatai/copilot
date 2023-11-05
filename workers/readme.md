# Background Jobs for OpenChat and OpenCoPilot

This repository hosts a collection of background jobs shared by both the OpenChat and OpenCoPilot projects. Our primary aim is to offer a resource-efficient native C image that can be effortlessly stored on Docker Hub.

## Running the Celery Worker

To activate the Celery worker for this project, use the following command:

```bash
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES && celery -A celery_app worker --loglevel=info

```
---


## This has to be converted to c binary executable, may even want to convert it into cython


`python -m nuitka --onefile --standalone --follow-imports app.py`



## Resume from this error
Foreign key associated with column 'pdf_data_sources.chatbot_id' could not find table 'chatbots' with which to generate a foreign key to target column 'id'