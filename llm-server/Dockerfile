# Common stage
FROM python:3.9-slim AS common
WORKDIR /app
COPY requirements.txt /app/
RUN pip install -r requirements.txt
COPY . /app/

# Development stage
FROM common AS development
EXPOSE 8002
RUN pip install debugpy
CMD ["python", "-m", "debugpy", "--listen", "0.0.0.0:5678", "--wait-for-client", "-m", "flask", "run", "--host=0.0.0.0", "--port=8002", "--reload"]

# Production stage
FROM common AS production
EXPOSE 8002
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=8002", "--reload"]
