FROM python:3.9-slim

WORKDIR /app

# Copy only the requirements.txt initially to leverage Docker cache
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# After pip install, copy the entire source code into the container at /app
COPY . /app

# Corrected CMD instruction
CMD ["celery", "-A", "workers.celery_app", "worker", "--loglevel=info"]
