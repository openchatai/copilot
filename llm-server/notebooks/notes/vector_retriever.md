# Heading

https://python.langchain.com/docs/modules/memory/types/vectorstore_retriever_memory

## Using vector store as knowledge to store last 5 api calls and so on
```py
from langchain.memory import VectorStoreRetrieverMemory
from langchain.vectorstores import FAISS
from langchain.docstore import InMemoryDocstore
from langchain.embeddings.openai import OpenAIEmbeddings
import faiss

# Initialize the VectorStore
embedding_size = 1536  # Dimensions of the OpenAIEmbeddings
index = faiss.IndexFlatL2(embedding_size)
embedding_fn = OpenAIEmbeddings().embed_query
vectorstore = FAISS(embedding_fn, index, InMemoryDocstore({}), {})

# Create the VectorStoreRetrieverMemory
retriever = vectorstore.as_retriever(search_kwargs=dict(k=1))
memory = VectorStoreRetrieverMemory(retriever=retriever)

# Save and load memories
memory.save_context({"input": "My favorite food is pizza"}, {"output": "that's good to know"})
memory.save_context({"input": "My favorite sport is soccer"}, {"output": "..."})
memory.save_context({"input": "I don't like the Celtics"}, {"output": "ok"})

# Retrieve relevant information from the memory
result = memory.load_memory_variables({"prompt": "what sport should I watch?"})
print(result["history"])
```

# Query last 5 documents from VectorStoreRetrieverMemory
result = memory.load_memory_variables({}, limit=5, order_by="desc")
print(result["history"])