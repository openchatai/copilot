import os
from utils.llm_consts import get_mysql_uri

class Config:
    SQLALCHEMY_DATABASE_URI = get_mysql_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = (
        False  # Disable tracking modifications for SQLAlchemy
    )
