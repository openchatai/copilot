from typing import List

from langchain.docstore.document import Document
from pydantic import BaseModel


class DocumentSimilarityDTO(BaseModel):
    document: Document
    score: float
    type: str


def select_top_documents(documents: List[DocumentSimilarityDTO]) -> List[DocumentSimilarityDTO]:
    # Sort the documents by score in descending order
    documents.sort(key=lambda dto: dto.score, reverse=True)

    selected_documents = []
    previous_diff = 0

    for i in range(len(documents) - 1):
        selected_documents.append(documents[i])
        current_diff = documents[i].score - documents[i + 1].score

        # Check if the difference is too large or exceeds 0.3
        if current_diff > 0.3 or (previous_diff > 0 and current_diff / previous_diff > 1):
            break

        previous_diff = current_diff

    return selected_documents

