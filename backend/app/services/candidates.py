import json
import uuid

from pgvector.psycopg2 import register_vector

from app.database import get_conn
from app.utils.embeddings import get_embedding
from app.schemas.candidate import CandidateCreate, CandidateUpdate, CandidatePatch

_TEXT_FIELDS = {"summary", "experience", "education", "certifications"}


def _build_embedding_text(summary: str, experience: list, education: list, certifications: list) -> str:
    parts = [summary]
    for exp in experience:
        parts.append(f"{exp['role']} at {exp['company']}: {exp['description']}")
    for edu in education:
        parts.append(f"{edu['degree']} at {edu['institution']}")
    for cert in certifications:
        parts.append(f"Certification: {cert['name']} by {cert['issuer']}")
    return " | ".join(parts)


def _row_to_dict(row: tuple) -> dict:
    id_, name, photo, location, email, phone, summary, experience, education, certifications = row
    return {
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
    }


def list_candidates() -> list[dict]:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, photo, location, email, phone, summary,
                   experience, education, certifications
            FROM candidates
            ORDER BY name
        """)
        return [_row_to_dict(row) for row in cur.fetchall()]


def get_candidate(candidate_id: str) -> dict | None:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("""
            SELECT id, name, photo, location, email, phone, summary,
                   experience, education, certifications
            FROM candidates
            WHERE id = %s
        """, (candidate_id,))
        row = cur.fetchone()
    return _row_to_dict(row) if row else None


def create_candidate(data: CandidateCreate) -> dict:
    candidate_id = data.id or str(uuid.uuid4())
    experience = [e.model_dump() for e in data.experience]
    education = [e.model_dump() for e in data.education]
    certifications = [c.model_dump() for c in data.certifications]
    embedding = get_embedding(_build_embedding_text(data.summary, experience, education, certifications))

    with get_conn() as conn:
        register_vector(conn)
        cur = conn.cursor()
        cur.execute("""
            INSERT INTO candidates
                (id, name, photo, location, email, phone, summary,
                 experience, education, certifications, embedding)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id, name, photo, location, email, phone, summary,
                      experience, education, certifications
        """, (
            candidate_id,
            data.name,
            data.photo or "",
            data.location or "",
            data.email or "",
            data.phone or "",
            data.summary,
            json.dumps(experience, ensure_ascii=False),
            json.dumps(education, ensure_ascii=False),
            json.dumps(certifications, ensure_ascii=False),
            embedding,
        ))
        return _row_to_dict(cur.fetchone())


def update_candidate(candidate_id: str, data: CandidateUpdate) -> dict | None:
    experience = [e.model_dump() for e in data.experience]
    education = [e.model_dump() for e in data.education]
    certifications = [c.model_dump() for c in data.certifications]
    embedding = get_embedding(_build_embedding_text(data.summary, experience, education, certifications))

    with get_conn() as conn:
        register_vector(conn)
        cur = conn.cursor()
        cur.execute("""
            UPDATE candidates SET
                name = %s, photo = %s, location = %s, email = %s, phone = %s,
                summary = %s, experience = %s, education = %s,
                certifications = %s, embedding = %s
            WHERE id = %s
            RETURNING id, name, photo, location, email, phone, summary,
                      experience, education, certifications
        """, (
            data.name,
            data.photo or "",
            data.location or "",
            data.email or "",
            data.phone or "",
            data.summary,
            json.dumps(experience, ensure_ascii=False),
            json.dumps(education, ensure_ascii=False),
            json.dumps(certifications, ensure_ascii=False),
            embedding,
            candidate_id,
        ))
        row = cur.fetchone()
    return _row_to_dict(row) if row else None


def patch_candidate(candidate_id: str, data: CandidatePatch) -> dict | None:
    sent = data.model_fields_set
    if not sent:
        return get_candidate(candidate_id)

    updates: dict = {}
    for field in sent:
        value = getattr(data, field)
        if field in ("experience", "education", "certifications") and value is not None:
            updates[field] = json.dumps([item.model_dump() for item in value], ensure_ascii=False)
        else:
            updates[field] = value

    needs_embedding = bool(sent & _TEXT_FIELDS)
    if needs_embedding:
        current = get_candidate(candidate_id)
        if current is None:
            return None
        merged_summary = updates.get("summary", current["summary"])
        merged_exp = json.loads(updates["experience"]) if "experience" in updates else current["experience"]
        merged_edu = json.loads(updates["education"]) if "education" in updates else current["education"]
        merged_cert = json.loads(updates["certifications"]) if "certifications" in updates else current["certifications"]
        embedding = get_embedding(_build_embedding_text(merged_summary, merged_exp, merged_edu, merged_cert))
        updates["embedding"] = embedding

    set_clause = ", ".join(f"{col} = %s" for col in updates)
    values = list(updates.values()) + [candidate_id]

    with get_conn() as conn:
        register_vector(conn)
        cur = conn.cursor()
        cur.execute(f"""
            UPDATE candidates SET {set_clause}
            WHERE id = %s
            RETURNING id, name, photo, location, email, phone, summary,
                      experience, education, certifications
        """, values)
        row = cur.fetchone()
    return _row_to_dict(row) if row else None


def delete_candidate(candidate_id: str) -> bool:
    with get_conn() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM candidates WHERE id = %s", (candidate_id,))
        return cur.rowcount > 0
