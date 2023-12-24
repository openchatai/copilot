# Getting Started Guide: Debugging "opencopilot" with VS Code

Welcome to the world of local development and debugging for the "opencopilot" Flask application! This comprehensive guide will walk you through the setup process, leveraging the power of VS Code for a seamless debugging experience. Let's dive in!

## Prerequisites

Before we embark on this debugging journey, ensure you have the following tools installed on your machine:

- [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html)
- [VS Code](https://code.visualstudio.com/download)
- [Python extension for VS Code](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

## Conda Installation

Refer to the [official Conda installation guide](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) suitable for your operating system. Once installed, validate your Conda setup by running `conda --version` in your terminal.

## Mypy Installation [Optional]

Enhance your development experience with Mypy (optional):

1. Activate your Conda environment.
2. Install Mypy: `pip install mypy`

## Copilot LLM Flask Application Setup

### Prerequisites

1. Begin by cloning the "opencopilot" Flask app repository to your local machine.

## Environmental Configuration

To configure the environment for the "llm_server" project, follow these steps:

1. **Create `.env` File:**
   Create a file named `.env` at the root of the "llm_server" directory to store environmental configuration settings for local development.

   **Example .env File:**
   ```ini
   OPENAI_API_KEY=<YOUR OPEN AI KEY>
   ```

2. **Additional Environment Variables (Optional):**
   You can set additional environment variables to fine-tune your copilots. While these variables are not mandatory, you may choose to configure them based on your needs.

   - `PINECONE_API_KEY`: Your Pinecone API key.
   - `PINECONE_ENV`: Your Pinecone environment.
   - `MONGODB_URI`: MongoDB connection string.
   - `QDRANT_SERVER_URI`: QDRANT server URL.
   - `QDRANT_API_KEY`: Your QDRANT API key.
   - `QDRANT_PASS`: Base64-encoded string for QDRANT pass.
   - `ACTIONS_SCORE_THRESHOLD`: Threshold for actions score (default: 0.5).
   - `FLOWS_SCORE_THRESHOLD`: Threshold for flows score (default: 0.5).
   - `KB_SCORE_THRESHOLD`: Threshold for KB score (default: 0.5).
   - `TARGET`: Environment target (default: development).

   Note: Adjust the values according to your specific configuration requirements.


### Project Dependencies

Install project dependencies: `pip install -r requirements.txt`

### Debugging Locally with VS Code

1. Enable debugging by selecting the 'Flask' debug configuration.
2. Press 'F5' to start debugging.

## Docker Debugging

Assuming you have Docker and Docker Compose installed, set `TARGET=development` in [Makefile].

1. Run `make install` or `make install-arm` based on the system architecture
2. Navigate to the "llm-server" directory.
3. Configure the 'Attach to flask in docker' option in VS Code and attach to the running container for debugging. The Flask process will not start until the debugger is attached.
   
Enjoy the magic of hot reloading during debugging sessions inside Docker containers. No need to restart the container after each code change.

Happy debugging! 🚀

---