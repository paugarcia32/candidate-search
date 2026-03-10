import chromadb
from embeddings import get_embedding

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="candidates")


def search_candidates(query: str, top_k: int) -> list[dict]:
    query_embedding = get_embedding(query)
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["metadatas", "distances"],
    )

    candidates = []
    for metadata, distance in zip(results["metadatas"][0], results["distances"][0]):
        # ChromaDB returns L2 distance; convert to a similarity score in [0, 1]
        score = round(1 / (1 + distance), 4)
        candidates.append(
            {
                "name": metadata["name"],
                "score": score,
                "summary": metadata["summary"],
            }
        )
    return candidates
