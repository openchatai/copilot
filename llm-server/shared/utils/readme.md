## Project Description

In your `README.md` file, you can provide a detailed project description. Based on your provided description, it would look like this:

```markdown
# OpenCopilot Utility Library

The OpenCopilot Utility Library contains a collection of common utility functions, types, and interfaces used across the entire OpenCopilot application. It also provides essential embeddings for your project.

## Features

- A comprehensive set of utility functions.
- Common types and interfaces that are widely used within the application.
- Pre-configured embeddings for seamless integration.

## Getting Started

To start using the utility library, you can initialize your vector store with the provided embeddings using the following code:

```python
from shared.utils.opencopilot_utils import get_embeddings, init_vector_store, StoreOptions

embeddings = get_embeddings()
init_vector_store(docs, embeddings, StoreOptions(namespace=bot_id))
```

## Installation

You can install the library via pip:

```bash
pip install opencopilot-utils
```

## Usage

To use the utility functions and types, simply import them in your Python code:

```python
from shared.utils.opencopilot_utils import some_utility_function, SomeCommonType
```

For more details and examples, please refer to the official documentation.

## Contributing

We welcome contributions from the community. If you have suggestions, bug reports, or would like to contribute to the project, please check our [contribution guidelines](CONTRIBUTING.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Publishing Your Library

Increment the version of the library in setup.py
Use the publish script [publish.sh](./publish.sh) to publish the library