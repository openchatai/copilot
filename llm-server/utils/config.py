import os

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("MYSQL_URI", "mysql+pymysql://dbuser:dbpass@localhost:3307/opencopilot")
    SQLALCHEMY_TRACK_MODIFICATIONS = (
        False  # Disable tracking modifications for SQLAlchemy
    )
