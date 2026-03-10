# Candidate Search PoC

Natural language candidate search using semantic vector similarity —
local embeddings via `sentence-transformers`, PostgreSQL + pgvector for storage and search.
No external API key required.

---

## Quick Start (Docker Compose)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose plugin)

### 1. Configure environment

```bash
cp .env.example .env
```

The default values in `.env.example` work as-is for Docker Compose. No edits needed.

### 2. Start all services

```bash
docker compose up --build
```

This builds the backend and frontend images and starts PostgreSQL, the FastAPI backend, and the nginx frontend. The HuggingFace model (~90MB) is downloaded on the first run and cached in a Docker volume — subsequent starts are fast.

### 3. Ingest candidate data (first run only)

In a separate terminal, while the services are running:

```bash
docker compose run --rm backend uv run python ingest.py
```

This creates the `candidates` table, enables the pgvector extension, and loads all candidates from `data/candidates.json`.

### 4. Open the app

Visit **http://localhost:5173** in your browser.

---

## Local Development (without Docker)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ with [pgvector](https://github.com/pgvector/pgvector) installed
- `uv` — install with: `curl -LsSf https://astral.sh/uv/install.sh | sh`

### 1. Start PostgreSQL

The easiest option is to use Docker for just the database:

```bash
docker compose up db
```

Or use a local PostgreSQL instance — create a database named `candidates` and install the pgvector extension.

### 2. Configure environment

```bash
cp .env.example .env
# Edit DATABASE_URL if your local Postgres uses different credentials
```

### 3. Install backend dependencies and ingest data

```bash
cd backend
uv sync
uv run python ingest.py
```

### 4. Start the backend

```bash
uv run uvicorn app.main:app --reload --reload-exclude ".venv" --port 8000
```

### 5. Install frontend dependencies and start the dev server

```bash
cd frontend
npm install
npm run dev
```

The app is available at **http://localhost:5173**.
The Vite dev server proxies `/api/*` → `http://localhost:8000/*`.

---

## API

Base URL: `/api/v1`

Interactive docs available at `http://localhost:8000/docs` when the backend is running.

### Candidates

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/api/v1/candidates` | 200 | List all candidates |
| POST | `/api/v1/candidates` | 201 | Create a candidate |
| GET | `/api/v1/candidates/{id}` | 200 / 404 | Get a candidate |
| PUT | `/api/v1/candidates/{id}` | 200 / 404 | Full update |
| PATCH | `/api/v1/candidates/{id}` | 200 / 404 | Partial update |
| DELETE | `/api/v1/candidates/{id}` | 204 / 404 | Delete a candidate |
| POST | `/api/v1/candidates/search` | 200 | Semantic search |

---

#### `POST /api/v1/candidates`

**Request:**
```json
{
  "name": "Ana García",
  "photo": "https://example.com/photo.jpg",
  "location": "Madrid, España",
  "email": "ana@email.com",
  "phone": "+34 612 345 678",
  "summary": "Backend developer with 5 years of experience in Python and FastAPI",
  "experience": [
    { "company": "Acme", "role": "Backend Engineer", "start": "2020-01", "end": null, "description": "..." }
  ],
  "education": [
    { "institution": "UPM", "degree": "Computer Science", "start": "2014", "end": "2018" }
  ],
  "certifications": [
    { "name": "AWS Solutions Architect", "issuer": "Amazon", "year": 2022 }
  ]
}
```

**Response:** `201 Created` — the created candidate including its generated `id`.

---

#### `PATCH /api/v1/candidates/{id}`

Only sent fields are updated. The embedding is only regenerated if `summary`, `experience`, `education`, or `certifications` are included.

---

#### `POST /api/v1/candidates/search`

**Request:**
```json
{
  "query": "backend developer with Python experience",
  "top_k": 5
}
```

**Response:** `200 OK` — array of candidates ranked by relevance, each with a `score` field (0–1).

```json
[
  {
    "id": "1",
    "name": "Ana García",
    "score": 0.92,
    "summary": "Backend developer with 5 years of experience in Python and FastAPI...",
    "location": "Madrid, España",
    "email": "ana.garcia@email.com",
    "phone": "+34 612 345 678",
    "photo": "https://randomuser.me/api/portraits/women/44.jpg",
    "experience": [],
    "education": [],
    "certifications": []
  }
]
```
