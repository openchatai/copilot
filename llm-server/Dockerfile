# Use an official Python runtime as a parent image
FROM python:3.11-slim as production

# Set the working directory to /app
WORKDIR /app

# Add current directory files to worker dir in Docker
ADD . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
RUN apt-get update && apt-get -y install build-essential libssl-dev 

RUN pip install uwsgi
RUN pip install gevent

EXPOSE 8002

RUN uwsgi --help
# Run uwsgi when the container launches
CMD ["uwsgi", "--http", ":8002", "--gevent", "1000", "--http-websockets", "--master", "--wsgi-file", "app.py", "--callable", "app"]
