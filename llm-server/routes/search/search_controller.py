from fastapi import APIRouter, Request
from shared.utils.opencopilot_utils.get_embeddings import get_embeddings
from utils.get_logger import CustomLogger
from utils.llm_consts import VectorCollections, initialize_qdrant_client
from qdrant_client import models  # Add this line
from typing import List
from fastapi.responses import JSONResponse

search_router = APIRouter()

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


@search_router.get("/{chatbot_id}", response_model=List[str])
async def search_vector_store(request: Request, chatbot_id: str):
    keyword = request.query_params.get("keyword", "")
    results = get_all_results(chatbot_id, keyword)

    return JSONResponse(content=results, status_code=201)
