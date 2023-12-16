FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

COPY . /app

CMD ["celery", "-A", "workers.celery_app", "worker", "--loglevel=info"]
