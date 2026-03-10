import json
from pgvector.psycopg2 import register_vector
from app.database import get_conn
from app.utils.embeddings import get_embedding

with open("data/candidates.json", "r", encoding="utf-8") as f:
    candidates = json.load(f)

print(f"Ingesting {len(candidates)} candidates...")

# Create extension first in its own transaction, then register the vector type
with get_conn() as conn:
    conn.cursor().execute("CREATE EXTENSION IF NOT EXISTS vector")

with get_conn() as conn:
    register_vector(conn)
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS candidates (
            id             TEXT PRIMARY KEY,
            name           TEXT NOT NULL,
            photo          TEXT,
            location       TEXT,
            email          TEXT,
            phone          TEXT,
            summary        TEXT,
            experience     JSONB    DEFAULT '[]',
            education      JSONB    DEFAULT '[]',
            certifications JSONB    DEFAULT '[]',
            embedding      vector(384)
        )
    """)

    for candidate in candidates:
        parts = [candidate["summary"]]
        for exp in candidate.get("experience", []):
            parts.append(f"{exp['role']} at {exp['company']}: {exp['description']}")
        for edu in candidate.get("education", []):
            parts.append(f"{edu['degree']} at {edu['institution']}")
        for cert in candidate.get("certifications", []):
            parts.append(f"Certification: {cert['name']} by {cert['issuer']}")

        embedding = get_embedding(" | ".join(parts))

        cur.execute("""
            INSERT INTO candidates
                (id, name, photo, location, email, phone, summary,
                 experience, education, certifications, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO UPDATE SET
                name           = EXCLUDED.name,
                photo          = EXCLUDED.photo,
                location       = EXCLUDED.location,
                email          = EXCLUDED.email,
                phone          = EXCLUDED.phone,
                summary        = EXCLUDED.summary,
                experience     = EXCLUDED.experience,
                education      = EXCLUDED.education,
                certifications = EXCLUDED.certifications,
                embedding      = EXCLUDED.embedding
        """, (
            candidate["id"],
            candidate["name"],
            candidate.get("photo", ""),
            candidate.get("location", ""),
            candidate.get("email", ""),
            candidate.get("phone", ""),
            candidate["summary"],
            json.dumps(candidate.get("experience", []), ensure_ascii=False),
            json.dumps(candidate.get("education", []), ensure_ascii=False),
            json.dumps(candidate.get("certifications", []), ensure_ascii=False),
            embedding,
        ))
        print(f"  Ingested: {candidate['name']}")

    cur.execute("""
        CREATE INDEX IF NOT EXISTS candidates_embedding_idx
        ON candidates USING ivfflat (embedding vector_cosine_ops)
        WITH (lists = 10)
    """)

print("Done.")
