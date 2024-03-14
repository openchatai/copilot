from routes.search.search_service import Item
from typing import List

# from utils.llm_consts import meilisearch_client


INDEX_NAME = "opencopilot_v0"


def add_item_to_index(items: List[Item]):
    # index = meilisearch_client.index(INDEX_NAME)
    # documents = [item.model_dump() for item in items]
    # info = index.add_documents(documents, primary_key="id")
    pass


def create_index_with_settings():
    # index = meilisearch_client.create_index(INDEX_NAME, {"primaryKey": "id"})
    # return index.model_dump()
    pass


def update_index_settings():
    # index = meilisearch_client.index(INDEX_NAME)
    # index.update_searchable_attributes(["title", "heading_text"])
    # index.update_filterable_attributes(["chatbot_id", "token"])

    # return index
    pass


def search_with_filters(
    query: str,
    token: str,
    limit: int = 10,
    offset: int = 0,
):
    # index = meilisearch_client.index(INDEX_NAME)

    # # Perform the search with filters, limit, and offset
    # search_params = {
    #     "filter": [f"token={token}"],
    #     "limit": limit,
    #     "offset": offset,
    # }
    # search_results = index.search(query, search_params)

    # return search_results
    pass
