import json
import chromadb
from embeddings import get_embedding

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="candidates")

with open("data/candidates.json", "r", encoding="utf-8") as f:
    candidates = json.load(f)

print(f"Ingesting {len(candidates)} candidates...")

for candidate in candidates:
    embedding = get_embedding(candidate["summary"])
    collection.upsert(
        ids=[candidate["id"]],
        embeddings=[embedding],
        metadatas=[{"name": candidate["name"], "summary": candidate["summary"]}],
    )
    print(f"  Ingested: {candidate['name']}")

print("Done.")
