from typing import List, Dict

from langchain.docstore.document import Document
from langchain_core.load.serializable import Serializable

from utils.llm_consts import VectorCollections


class DocumentSimilarityDTO(Serializable):
    document: Document
    score: float
    type: str


def select_top_documents(
    documents: List[DocumentSimilarityDTO],
) -> Dict[str, List[DocumentSimilarityDTO]]:
    # Sort the documents by score in descending order
    documents.sort(key=lambda dto: dto.score, reverse=True)

    selected_documents = []
    previous_diff = 0

    for i in range(len(documents) - 1):
        selected_documents.append(documents[i])
        current_diff = documents[i].score - documents[i + 1].score

        # Check if the difference is too large or exceeds 0.3
        if current_diff > 0.3 or (
            previous_diff > 0 and current_diff / previous_diff > 1
        ):
            break

        previous_diff = current_diff

    # Categorize documents based on the 'type' field
    categorized_documents = {
        VectorCollections.knowledgebase: [],
        VectorCollections.actions: [],
        VectorCollections.flows: [],
    }

    for document in selected_documents:
        if document.type == VectorCollections.knowledgebase:
            categorized_documents[VectorCollections.knowledgebase].append(document)
        elif document.type == VectorCollections.actions:
            categorized_documents[VectorCollections.actions].append(document)
        elif document.type == VectorCollections.flows:
            categorized_documents[VectorCollections.flows].append(document)

    return categorized_documents
