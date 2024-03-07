from flask import Blueprint, jsonify, request
from shared.utils.opencopilot_utils.get_embeddings import get_embeddings
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections, initialize_qdrant_client
from qdrant_client import models  # Add this line
from routes.search.search_service import weighted_search
from routes.search.meilisearch_service import search_with_filters
from pydantic import BaseModel

search_workflow = Blueprint("search", __name__)

logger = CustomLogger(__name__)
client = initialize_qdrant_client()


def get_all_results(chatbot_id: str, keyword: str, limit: int = 10, offset: int = 0):
    embedding = get_embeddings()
    query_vector = embedding.embed_query(keyword)

    query_response = client.search(
        collection_name=VectorCollections.knowledgebase,
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.bot_id",
                    match=models.MatchValue(value=chatbot_id),
                )
            ]
        ),
        query_vector=query_vector,
        with_payload=True,
        limit=limit,
        search_params=models.SearchParams(hnsw_ef=128, exact=False),
    )

    results = []
    for response in query_response:
        results.append(response.model_dump())

    return results


@search_workflow.route("/<chatbot_id>", methods=["GET"])
def search_vector_store(chatbot_id: str):
    keyword = request.args.get("keyword", "")
    results = get_all_results(chatbot_id, keyword)

    return jsonify(results), 201


class WeightedSearchRequest(BaseModel):
    query: str
    title_weight: float = 0.7
    description_weight: float = 0.3


@search_workflow.route("/fastsearch/<token>", methods=["GET"])
def fast_search(token: str):
    query = request.args.get("query", "")
    result = search_with_filters(query, token)

    return jsonify(result, 200)


@search_workflow.route("/cmd_bar/<chatbot_id>", methods=["POST"])
def get_cmdbar_data(chatbot_id: str):
    try:
        request_data = WeightedSearchRequest(
            **request.get_json()
        )  # Assuming you have a class to parse data
        scored_points = weighted_search(
            chatbot_id,
            request_data.query,
            request_data.title_weight,
            request_data.description_weight,
        )
        return (
            jsonify([sp.model_dump() for sp in scored_points]),
            200,
        )

    except ValueError as e:  # Example of handling a potential error
        return jsonify({"error": str(e)}), 400  # Bad request
    except Exception as e:
        return jsonify({"error": "Internal server error"}), 500
