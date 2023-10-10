class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///your_database.db"  # Use SQLite as an example
    SQLALCHEMY_TRACK_MODIFICATIONS = (
        False  # Disable tracking modifications for SQLAlchemy
    )
