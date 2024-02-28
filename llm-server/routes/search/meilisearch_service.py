from routes.search.search_service import Item
from typing import Any, Dict, List
from utils.llm_consts import meilisearch_client, USE_MEILISEARCH
from utils.get_logger import CustomLogger

logger = CustomLogger(__name__)

INDEX_NAME = "opencopilot_v0"


def add_item_to_index(items: List[Item]):
    if not USE_MEILISEARCH:
        logger.info("MeiliSearch is disabled. Skipping add_item_to_index.")
        return []  # Return an empty list or a default response

    index = meilisearch_client.index(INDEX_NAME)
    documents = [item.model_dump() for item in items]
    info = index.add_documents(documents, primary_key="id")
    logger.info("MEILISEARCH", info="Added documents to index", extra={"info": info})
    return info


def create_index_with_settings():
    if not USE_MEILISEARCH:
        logger.info("MeiliSearch is disabled. Skipping create_index_with_settings.")
        return None  # Return None or a default response

    index = meilisearch_client.create_index(INDEX_NAME, {"primaryKey": "id"})
    return index.model_dump()


def update_index_settings():
    if not USE_MEILISEARCH:
        logger.info("MeiliSearch is disabled. Skipping update_index_settings.")
        return None  # Return None or a default response

    index = meilisearch_client.index(INDEX_NAME)
    index.update_searchable_attributes(["title", "heading_text"])
    index.update_filterable_attributes(["chatbot_id", "token"])
    return index


def search_with_filters(query: str, token: str, limit: int = 10, offset: int = 0):
    if not USE_MEILISEARCH:
        logger.info("MeiliSearch is disabled. Skipping search_with_filters.")
        return []  # Return an empty list or a default response

    index = meilisearch_client.index(INDEX_NAME)
    search_params = {
        "filter": [f"token={token}"],
        "limit": limit,
        "offset": offset,
    }
    search_results = index.search(query, search_params)
    return search_results
