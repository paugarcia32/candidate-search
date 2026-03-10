from pgvector.psycopg2 import register_vector

from app.database import get_conn
from app.utils.embeddings import get_embedding


def search_candidates(query: str, top_k: int) -> list[dict]:
    query_embedding = get_embedding(query)

    with get_conn() as conn:
        register_vector(conn)
        cur = conn.cursor()
        cur.execute("""
            SELECT
                id, name, photo, location, email, phone, summary,
                experience, education, certifications,
                1 - (embedding <=> %s::vector) AS score
            FROM candidates
            ORDER BY embedding <=> %s::vector
            LIMIT %s
        """, (query_embedding, query_embedding, top_k))
        rows = cur.fetchall()

    candidates = []
    for row in rows:
        id_, name, photo, location, email, phone, summary, \
            experience, education, certifications, score = row
        candidates.append({
            "id": id_,
            "name": name,
            "photo": photo or "",
            "location": location or "",
            "email": email or "",
            "phone": phone or "",
            "summary": summary or "",
            "experience": experience if isinstance(experience, list) else [],
            "education": education if isinstance(education, list) else [],
            "certifications": certifications if isinstance(certifications, list) else [],
            "score": round(float(score), 4),
        })
    return candidates
