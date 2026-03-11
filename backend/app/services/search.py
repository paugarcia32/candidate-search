from pgvector.psycopg2 import register_vector

from app.database import get_conn
from app.utils.embeddings import get_embedding


def search_candidates(query: str, top_k: int, min_score: float | None = None, location: str | None = None) -> list[dict]:
    query_embedding = get_embedding(query)

    with get_conn() as conn:
        register_vector(conn)
        cur = conn.cursor()
        cur.execute("""
            WITH ranked AS (
                SELECT
                    id, name, photo, location, email, phone, summary,
                    experience, education, certifications,
                    1 - (embedding <=> %s::vector) AS score
                FROM candidates
                WHERE (%s IS NULL OR location = %s)
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            )
            SELECT * FROM ranked
            WHERE (%s IS NULL OR score >= %s)
            ORDER BY score DESC
        """, (query_embedding, location, location, query_embedding, top_k, min_score, min_score))
        rows = cur.fetchall()

    candidates = []
    for row in rows:
        id_, name, photo, location_, email, phone, summary, \
            experience, education, certifications, score = row
        candidates.append({
            "id": id_,
            "name": name,
            "photo": photo or "",
            "location": location_ or "",
            "email": email or "",
            "phone": phone or "",
            "summary": summary or "",
            "experience": experience if isinstance(experience, list) else [],
            "education": education if isinstance(education, list) else [],
            "certifications": certifications if isinstance(certifications, list) else [],
            "score": round(float(score), 4),
        })
    return candidates
