# vector_db_interface.py
from abc import ABC, abstractmethod


class VectorDBInterface(ABC):
    @abstractmethod
    def add_data_with_meta(self, namespace, context, vectors):
        pass

    @abstractmethod
    def perform_search(self, namespace, context, query):
        pass
