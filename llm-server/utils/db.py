# type: ignore
from pymongo import MongoClient
from pymongo.database import Database as PyMongoDatabase
import os


class NoSQLDatabase:
    _instance: MongoClient = None

    def __new__(cls, app=None):
        if cls._instance is None:
            cls._instance = super().__new__(cls)

            mongo_url = os.environ.get("MONGODB_URL")
            cls._instance.client = MongoClient(mongo_url)

            cls._instance.db = cls._instance.client.opencopilot

        return cls._instance

    @staticmethod
    def get_db() -> PyMongoDatabase:
        return NoSQLDatabase._instance.db
