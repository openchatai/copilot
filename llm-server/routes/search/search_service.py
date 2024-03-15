import uuid
from shared.utils.opencopilot_utils.get_embeddings import get_embeddings
from utils.llm_consts import VectorCollections, initialize_qdrant_client
from qdrant_client import models
from typing import Dict, List, Optional
import operator
from copy import deepcopy
from utils.llm_consts import ENABLE_NEURAL_SEARCH
from pydantic import BaseModel

client = initialize_qdrant_client()
embedding = get_embeddings()


# Data structure (you might want to define a custom class/dataclass)
class Item(BaseModel):
    id: str
    title: str
    heading_text: str
    heading_id: str
    token: str
    url: str


# Function to add vectors to Qdrant
def add_cmdbar_data(items: List[Item], metadata: Dict[str, str]) -> None:
    points = []  # Batch of points to insert

    titles = list(map(operator.attrgetter("title"), items))
    headings = list(map(operator.attrgetter("heading_text"), items))

    # this logic has to be removed, currently we are only using the html title....
    title_embedding = None
    if len(titles) > 3 and (titles[0] == titles[1] == titles[2] == titles[3]):
        e = embedding.embed_query(titles[0])
        title_embeddings = [e for _ in range(len(titles))]

    else:
        title_embeddings = embedding.embed_documents(titles)

    description_embeddings = embedding.embed_documents(headings)
    for index, item in enumerate(items):
        title_embedding = title_embeddings[index]
        description_embedding = description_embeddings[index]
        _metadata = deepcopy(metadata)
        _metadata["title"] = item.title
        _metadata["description"] = item.heading_text or ""
        _metadata["heading_id"] = item.heading_id or ""

        points.append(
            models.PointStruct(
                id=uuid.uuid4().hex,  # Placeholder - See explanation below
                payload={"metadata": _metadata},
                vector={
                    "description": title_embedding,
                    "title": description_embedding,
                },
            )
        )

    # Perform a single batch insert
    client.upsert(collection_name=VectorCollections.neural_search, points=points)


# Function to search with weights
def weighted_search(
    chatbot_id: str,
    query: str,
    title_weight: float = 0.7,
    description_weight: float = 0.3,
) -> List[models.ScoredPoint]:
    query_embedding = embedding.embed_query(query)

    # Search title and descriptions
    title_results = client.search(
        collection_name=VectorCollections.neural_search,
        query_vector=models.NamedVector(name="title", vector=query_embedding),
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.bot_id",
                    match=models.MatchValue(value=str(chatbot_id)),
                )
            ]
        ),
        limit=20,
        with_payload=True,
        with_vectors=False,
    )

    description_results = client.search(
        collection_name=VectorCollections.neural_search,
        query_vector=models.NamedVector(name="description", vector=query_embedding),
        query_filter=models.Filter(
            must=[
                models.FieldCondition(
                    key="metadata.bot_id",
                    match=models.MatchValue(value=chatbot_id),
                )
            ]
        ),
        limit=20,
        with_payload=True,
        with_vectors=False,
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
