from pymongo import MongoClient
from pymongo.database import Database as PyMongoDatabase


class Database:
    _instance: MongoClient

    def __new__(cls, app=None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.client = MongoClient(
                "localhost", 27017, username="dbuser", password="dbpass"
            )
            cls._instance.db = cls._instance.client.opencopilot
        return cls._instance

    def get_db(self) -> PyMongoDatabase:
        return self._instance.db  # Use _instance to access the shared instance
