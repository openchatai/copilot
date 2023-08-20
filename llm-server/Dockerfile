# Use an official Python runtime as the base image
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file into the container at /app
COPY requirements.txt /app/

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the current directory contents into the container at /app
COPY . /app/

# Make port 80 available to the world outside this container
EXPOSE 5000

# Define environment variable
ENV OPENAI_API_KEY YOU_TOKEN_HERE

# Run app.py when the container launches
CMD ["python", "app.py"]
