import configparser
from utils.llm_consts import get_mysql_uri

# Read the alembic.ini file
config = configparser.ConfigParser()
config.read('alembic.ini')

# Set the dynamic URL in the [alembic] section
config.set('alembic', 'sqlalchemy.url', get_mysql_uri())

# Write the modified configuration back to alembic.ini
with open('alembic.ini', 'w') as config_file:
    config.write(config_file)