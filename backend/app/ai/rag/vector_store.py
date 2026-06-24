import numpy as np

try:
    import faiss
except ImportError:
    faiss = None


class VectorStore:
    def __init__(self, dimension):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(dimension) if faiss else None
        self.embeddings = []
        self.text_chunks = []

    def add_embeddings(self, embeddings, chunks):
        """
        Add generated embeddings and their corresponding text chunks to the store.
        """
        embeddings = np.array(embeddings).astype("float32")
        if self.index is not None:
            self.index.add(embeddings)
        else:
            self.embeddings.extend(embeddings)
        self.text_chunks.extend(chunks)

    def search(self, query_embedding, top_k=3):
        """
        Perform a flat L2 search on the FAISS index to find the top_k most similar chunks.
        """
        query_embedding = np.array([query_embedding]).astype("float32")
        if self.index is None:
            return self._numpy_search(query_embedding[0], top_k)

        distances, indices = self.index.search(query_embedding, top_k)
        
        results = []
        for idx in indices[0]:
            # Guard against invalid indexes returned by FAISS (e.g. -1 if flat index has fewer items than top_k)
            if idx != -1 and idx < len(self.text_chunks):
                results.append(self.text_chunks[idx])
        return results

    def _numpy_search(self, query_embedding, top_k):
        if not self.embeddings:
            return []

        embeddings = np.array(self.embeddings).astype("float32")
        distances = np.linalg.norm(embeddings - query_embedding, axis=1)
        ranked_indices = np.argsort(distances)[:top_k]

        return [
            self.text_chunks[idx]
            for idx in ranked_indices
            if idx < len(self.text_chunks)
        ]
