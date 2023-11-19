# Getting Started 

This guide will walk you through setting up "copilot_llm" for local development with VS Code debugging. Additionally, it will demonstrate how to use environment variables for configuration and how to install Conda and Mypy.

## Prerequisites
Before you begin, make sure you have the following prerequisites installed:

- [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)
- [VS Code](https://code.visualstudio.com/download)
- [Python extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

## Conda Installation

If you don't already have Conda installed, follow these steps:

1. Download and install Conda by following the official [Conda installation guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) for your operating system.

2. Verify that Conda is installed correctly by opening a terminal or command prompt and running:

   ```shell
   conda --version
   ```

   You should see the Conda version displayed.

## Mypy Installation

To install Mypy, which is a static type checker for Python, follow these steps:

1. Ensure you have Conda installed (as described above).

2. Create a Conda environment named "copilot" for your project:

   ```shell
   conda create --name copilot
   ```

3. Activate the Conda environment:

   ```shell
   conda activate copilot
   ```

4. Install Mypy using `pip` within your Conda environment:

   ```shell
   pip install mypy
   ```

   Mypy is now installed and ready for use within your Conda environment.

## Flask Application Setup

1. Ensure you have the "copilot_llm" Flask app repository cloned to your local machine.

2. Create two environment configuration files in the root of the "llm_server": `.env` and `.env.docker`. These files will store your environment variables, and they serve different purposes. Here's an example of what each of these files might contain:

   For the `.env` file (used for local development):

   ```shell
   OPENAI_API_TYPE=openai
   OPENAI_API_KEY=your_openai_api_key
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_ENV=your_pinecone_environment
   MONGODB_URL=mongodb://localhost:27017/opencopilot
   QDRANT_URL=http://localhost:6333
   STORE=QDRANT
   QDRANT_API_KEY=your_qdrant_api_key # If using a cloud-hosted version
   SCORE_THRESHOLD=0.95 # When using predefined workflows, this is the confidence score at which opencopilot should select your workflow. If the score falls below this, the planner will design its own workflow.
   ```


3. Install project dependencies:

   ```shell
   pip install -r requirements.txt 
   ```

4. Run the app in debug mode:

   - In VS Code, select the 'Flask' debug configuration.
   - Press F5 to start debugging.
   - Set breakpoints, inspect variables, and more.

Now you can develop your Flask app named "copilot_llm" locally with VS Code debugging, and your `.env` file keeps your API keys and other secrets out of source control. Additionally, Mypy is available for type checking within your Conda environment, helping you maintain a more robust and reliable codebase.


--- 

## Use of shared libraries:

- **opencopilot_db**: [Shared Database Models Readme](../workers/shared/models/readme.md)
  - Contains shared database schema files used in both workers and llm-server.

- **opencopilot_utils**: [Shared Utilities Readme](../workers/shared/utils/readme.md)
  - Contains utility functions that can be utilized by any of our microservices.

To deploy, follow these steps:

1. Increment the version in `setup.py`.
2. Use the publish script to publish the new library to the repository.
