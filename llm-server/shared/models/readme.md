```markdown
# opencopilot_db

`opencopilot_db` is a Python library that provides database schemas common for opencopilot main app and workers application. It defines SQLAlchemy models for working with databases, making it easy to integrate and manage your database operations.

## Installation

You can install `opencopilot_db` using pip:

```bash
pip install opencopilot_db
```

## Usage

**To create pool of connections use the following**
```py
from shared.models import create_database_schema
from dotenv import load_dotenv

import os
load_dotenv("../llm-server/.env")

create_database_schema()
```

### Importing the Models

```python
from shared.models.opencopilot_db.models import PdfDataSource, Chatbot
```

### Creating and Managing Database Records

```python
# Create a PdfDataSource
pdf_data_source = PdfDataSource(chatbot_id=1, files=['file1.pdf', 'file2.pdf'], folder_name='pdf_folder')
session.add(pdf_data_source)
session.commit()

# Query PdfDataSources
pdf_data_sources = session.query(PdfDataSource).all()
for pdf_data_source in pdf_data_sources:
    print(
        f"PdfDataSource ID: {pdf_data_source.id}, Chatbot ID: {pdf_data_source.bot_id}, Files: {pdf_data_source.files}")
```

### Working with the Chatbot Model

```python
# Create a Chatbot
chatbot = Chatbot(name="My Chatbot", website="https://example.com")
session.add(chatbot)
session.commit()

# Query Chatbots
chatbots = session.query(Chatbot).all()
for chatbot in chatbots:
    print(f"Chatbot ID: {chatbot.id}, Name: {chatbot.name}, Website: {chatbot.website}")
```

## Contributing

If you'd like to contribute to `opencopilot_db`, please follow these guidelines:

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and ensure that tests pass.
4. Submit a pull request to the `main` branch of the repository.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Special thanks to the SQLAlchemy project for making it easy to work with databases in Python.


## Publish guide
## Publishing Your Library

Increment the version of the library in setup.py
Use the publish script [publish.sh](./publish.sh) to publish the library