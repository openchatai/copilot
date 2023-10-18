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

2. Create a `.env` file in the root of the "copilot_llm" project to store your environment variables. Here's an example of what your `.env` file might contain:

   ```shell
   OPENAI_API_TYPE=openai
   OPENAI_API_KEY=
   PINECONE_API_KEY=
   PINECONE_ENV=
   MONGODB_URL=mongodb://localhost:27017/opencopilot
   QDRANT_URL=http://localhost:6333  
   STORE=QDRANT
   QDRANT_API_KEY= # When using cloud hosted version
   SCORE_THRESHOLD=0.95 # When using pre defined workflows, the confidence score at which the opencopilot should select your workflow. If the score falls below this, the planner will design it's own workflow
   ```

   Ensure you replace the placeholders with your actual API keys and configuration settings.

3. Install project dependencies:

   ```shell
   pip install -r requirements.txt 
   ```

4. Run the app in debug mode:

   - In VS Code, select the 'Flask' debug configuration.
   - Press F5 to start debugging.
   - Set breakpoints, inspect variables, and more.

Now you can develop your Flask app named "copilot_llm" locally with VS Code debugging, and your `.env` file keeps your API keys and other secrets out of source control. Additionally, Mypy is available for type checking within your Conda environment, helping you maintain a more robust and reliable codebase.