from langchain.vectorstores.base import VectorStore

def get_original_filename(unique_filename):
    # Split the unique filename into two parts: the random prefix and the original filename
    parts = unique_filename.split('_', 1)

    if len(parts) == 2:
        random_prefix, original_filename = parts
        return original_filename
    else:
        # If the unique filename format is incorrect, you may want to handle this error
        # or return None, depending on your use case.
        return None
    
    
def delete_by_metadata(vector_store: VectorStore):
    vector_store.dele
    