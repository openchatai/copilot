from typing import List, Dict, Optional

from langchain.docstore.document import Document
from langchain_core.load.serializable import Serializable

from utils.llm_consts import VectorCollections


class DocumentSimilarityDTO(Serializable):
    document: Document
    score: float
    type: str


def select_top_documents(
        documents: List[DocumentSimilarityDTO],
        filter_types: Optional[List[str]] = None
) -> Dict[str, List[DocumentSimilarityDTO]]:
    """
    Selects the top documents based on their similarity score and categorizes them. The method returns the top-scoring
    document for each requested type if filter_types is provided, otherwise, it categorizes documents based on the
    original 0.3 score difference rule.

    Args:
        documents (List[DocumentSimilarityDTO]): A list of DocumentSimilarityDTO objects representing the documents.
        filter_types (Optional[List[str]]): A list of types to filter the documents. If None, all types are included.

    Returns:
        Dict[str, List[DocumentSimilarityDTO]]: A dictionary containing the categorized documents.

    Raises:
        None
    """

    # Sort the documents by score in descending order
    documents.sort(key=lambda dto: dto.score, reverse=True)

    if filter_types is not None:
        # Return the highest scoring document for each requested type
        highest_scoring_docs = {}
        for doc in documents:
            if doc.type in filter_types:
                if doc.type not in highest_scoring_docs or doc.score > highest_scoring_docs[doc.type].score:
                    highest_scoring_docs[doc.type] = doc
        return {doc_type: [doc] for doc_type, doc in highest_scoring_docs.items()}
    else:
        # Original logic with 0.3 score difference rule
        selected_documents = []
        previous_diff = 0
        
        if len(documents) == 1 and documents[0].score > 0.5:
            selected_documents.append(documents[0])
        
        for i in range(len(documents) - 1):
            selected_documents.append(documents[i])
            current_diff = documents[i].score - documents[i + 1].score

            if current_diff > 0.3 or (previous_diff > 0 and current_diff / previous_diff > 1):
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
