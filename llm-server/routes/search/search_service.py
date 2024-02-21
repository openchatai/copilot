from shared.utils.opencopilot_utils.get_embeddings import get_embeddings
from utils.llm_consts import initialize_qdrant_client
from qdrant_client import models
from typing import Dict, List, Optional

client = initialize_qdrant_client()
embedding = get_embeddings()


# Data structure (you might want to define a custom class/dataclass)
class Item:
    title: str
    description: Optional[str]

    def __init__(self, title: str, description: Optional[str]) -> None:
        self.title = title
        self.description = description


# Function to add vectors to Qdrant
def add_cmdbar_data(data: List[Item], metadata: Dict[str, str]) -> None:
    for item in data:
        title_embedding = embedding.embed_query(item.title)
        description_embedding = embedding.embed_query(item.description or "")

        client.upsert(
            collection_name="neural_search",
            points=[
                models.PointStruct(
                    id=1,
                    payload={
                        "title": item.title,
                        "description": item.description,
                    },
                    vector={
                        "description": title_embedding,
                        "title": description_embedding,
                    },
                ),
            ],
        )


# Function to search with weights
def weighted_search(
    query: str, title_weight: float = 0.7, description_weight: float = 0.3
) -> List[models.ScoredPoint]:
    query_embedding = embedding.embed_query(query)

    # Search title and descriptions
    title_results = client.search(
        collection_name="neural_search",
        query_vector=models.NamedVector(name="title", vector=query_embedding),
        with_payload=True,
        with_vector=False,
    )

    description_results = client.search(
        collection_name="neural_search",
        query_vector=models.NamedVector(name="description", vector=query_embedding),
        with_payload=True,
        with_vector=False,
    )

    # Build a lookup for description results
    description_lookup = {result.id: result for result in description_results}

    # Combine, weigh, and sort results
    results: List[models.ScoredPoint] = []
    for title_result in title_results:
        matching_desc_result = description_lookup.get(title_result.id)
        if matching_desc_result:
            combined_score = (title_weight * title_result.score) + (
                description_weight * matching_desc_result.score
            )
            results.append(
                models.ScoredPoint(
                    version=1,
                    id=title_result.id,
                    payload=title_result.payload,
                    score=combined_score,
                )
            )

    results.sort(key=lambda x: x.score, reverse=True)
    return results
