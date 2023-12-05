# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the entire source code into the container at /app
COPY . /app

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Corrected CMD instruction
CMD ["celery", "-A", "workers.celery_app", "worker", "--loglevel=info"]
