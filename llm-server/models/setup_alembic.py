import configparser
import os

# Get the database connection details from environment variables
MYSQL_URI=os.getenv("MYSQL_URI")

# Read the alembic.ini file
config = configparser.ConfigParser()
config.read('alembic.ini')

# Set the dynamic URL in the [alembic] section
config.set('alembic', 'sqlalchemy.url', MYSQL_URI)

# Write the modified configuration back to alembic.ini
with open('alembic.ini', 'w') as config_file:
    config.write(config_file)