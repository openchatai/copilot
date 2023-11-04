# Use the PyPy slim image as the base
FROM pypy:3.9-slim

# Set the working directory
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends \ 
     build-essential gcc

RUN apt-get update && apt-get install -y cmake && apt-get install -y libopenblas-dev
RUN apt install -y rustc cargo
RUN pip install --upgrade pip
# Copy requirements and install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY . /app/

EXPOSE 8002 

# Run app with unbuffered logs
CMD ["pypy", "-u", "app.py"]