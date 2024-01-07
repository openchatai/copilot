# **Guide to Debugging "opencopilot" with VS Code**

Welcome to the local development and debugging guide for the "opencopilot" Flask application. This guide will help you set up your environment and effectively utilize VS Code for debugging.

## **Table of Contents**

- [Getting Started Guide: Debugging "opencopilot" with VS Code](#getting-started-guide-debugging-opencopilot-with-vs-code)
  - [Prerequisites](#prerequisites)
    - [Conda Installation](#conda-installation)
    - [Mypy Installation (Optional)](#mypy-installation-optional)
  - [Copilot LLM Flask Application Setup](#copilot-llm-flask-application-setup)
    - [Prerequisites](#prerequisites-1)
  - [Environmental Configuration](#environmental-configuration)
  - [Project Dependencies](#project-dependencies)
  - [Debugging Locally with VS Code](#debugging-locally-with-vs-code)
  - [Docker Debugging](#docker-debugging)
- [Use Open Source Model Environment Variables](#use-open-source-model-environment-variables)

---

## **Getting Started Guide: Debugging "opencopilot" with VS Code**

This section guides you through setting up your environment and using VS Code for debugging the "opencopilot" Flask application.

### **Prerequisites**

#### *Conda Installation*

Install Conda by following the [official Conda installation guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html), then check your Conda version with `conda --version`.

#### *Mypy Installation (Optional)*

For an enhanced development experience with Mypy (optional), activate your Conda environment and run `pip install mypy`.

### **Copilot LLM Flask Application Setup**

#### *Prerequisites*

1. Clone the "opencopilot" Flask App repository onto your local machine.

## **Environmental Configuration**

Configure the "llm\_server" project environment as follows:

1. **Create `.env` File**: At the root of the "llm\_server" directory, create a new `.env` file to hold environmental configuration settings for local development.

   Example `.env` File:
   ```ini
   OPENAI_API_KEY=<YOUR OPEN AI KEY>
   ```

2. **Set Additional Environment Variables (Optional)**
   Set any desired optional environment variables for copilot customization within the `.env` file.

   Optional variable examples include:
   ```js
      - `MONGODB_URI`: MongoDB connection string.
      - `QDRANT_SERVER_URI`: QDRANT server URL.
      - `QDRANT_API_KEY`: Your QDRANT API key.
      - `QDRANT_PASS`: Base64-encoded string for QDRANT pass.
      - `ACTIONS_SCORE_THRESHOLD`: Threshold for actions score (default: 0.5).
      - `FLOWS_SCORE_THRESHOLD`: Threshold for flows score (default: 0.5).
      - `KB_SCORE_THRESHOLD`: Threshold for KB score (default: 0.5).
      - `TARGET`: Environment target (default: production).
   ```
   Replace placeholders with appropriate configurations. For more information about these options, see the original documentation.

### **Project Dependencies**

To install required packages, execute `pip install -r requirements.txt` from the project directory.

### **Debugging Locally with VS Code**

1. Select the 'Flask' debug configuration.
2. Launch debug mode with F5.

### **Docker Debugging**

With Docker and Docker Compose installed, perform the following tasks:

1. In the Makefile, set `TARGET=development`.
2. Execute either `make install` or `make install-arm`, depending on your system architecture.
3. Within the "llm-server" directory, locate the Docker container for debugging purposes.
4. Attach the VSCode debugger to the running container for debugging. Wait for the Flask process to begin before proceeding.

Benefit from convenient hot reloading while debugging inside Docker containers without needing to restart the container after every code modification.

Happy debugging! 🚀

---

## **Use Open Source Model Environment Variables**

To use the open-source model, set the following environment variables, thanks to [Justin van Grootveld](https://github.com/jvgrootveld):

```plaintext
OPENAI_API_KEY=unused
CHAT_MODEL=openchat
EMBEDDING_PROVIDER=openchat
LOCAL_IP=http://host.docker.internal
VECTOR_SIZE=4096
```