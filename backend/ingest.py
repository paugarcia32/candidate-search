import json
import chromadb
from embeddings import get_embedding

chroma_client = chromadb.PersistentClient(path="./chroma_db")
collection = chroma_client.get_or_create_collection(name="candidates")

with open("data/candidates.json", "r", encoding="utf-8") as f:
    candidates = json.load(f)

print(f"Ingesting {len(candidates)} candidates...")

for candidate in candidates:
    # Build a rich text for embedding: summary + experience + education + certs
    parts = [candidate["summary"]]

    for exp in candidate.get("experience", []):
        parts.append(f"{exp['role']} at {exp['company']}: {exp['description']}")

    for edu in candidate.get("education", []):
        parts.append(f"{edu['degree']} at {edu['institution']}")

    for cert in candidate.get("certifications", []):
        parts.append(f"Certification: {cert['name']} by {cert['issuer']}")

    embed_text = " | ".join(parts)
    embedding = get_embedding(embed_text)

    collection.upsert(
        ids=[candidate["id"]],
        embeddings=[embedding],
        metadatas=[{
            "name": candidate["name"],
            "photo": candidate.get("photo", ""),
            "location": candidate.get("location", ""),
            "email": candidate.get("email", ""),
            "phone": candidate.get("phone", ""),
            "summary": candidate["summary"],
            # Arrays stored as JSON strings (ChromaDB only supports flat metadata)
            "experience": json.dumps(candidate.get("experience", []), ensure_ascii=False),
            "education": json.dumps(candidate.get("education", []), ensure_ascii=False),
            "certifications": json.dumps(candidate.get("certifications", []), ensure_ascii=False),
        }],
    )
    print(f"  Ingested: {candidate['name']}")

print("Done.")
