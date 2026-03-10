# Candidate Search PoC

Natural language candidate search using semantic vector similarity (local embeddings via `sentence-transformers` + ChromaDB). No API key required.

## Prerequisites

- Python 3.11+
- Node.js 18+

Install `uv` if you don't have it:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

---

## Setup

### 1. Install backend dependencies

```bash
cd backend
uv sync
```

### 2. Ingest candidates into ChromaDB

On the first run, `all-MiniLM-L6-v2` (~90MB) is downloaded automatically and cached in `~/.cache/huggingface`.

```bash
cd backend
uv run python ingest.py
```

### 3. Start the backend

```bash
cd backend
uv run uvicorn main:app --reload --reload-exclude ".venv" --port 8000
```

The API is now available at `http://localhost:8000`.

### 4. Install frontend dependencies and start the dev server

```bash
cd frontend
npm install
npm run dev
```

The app is now available at `http://localhost:5173`.

---

## Usage

Open `http://localhost:5173` in your browser, type a natural language description of the candidate profile you are looking for, and click **Search**.

## API

### `POST /search`

**Request body:**
```json
{
  "query": "backend developer with Python experience",
  "top_k": 5
}
```

**Response:**
```json
{
  "results": [
    {
      "name": "Ana García",
      "score": 0.92,
      "summary": "Backend developer with 5 years of experience in Python..."
    }
  ]
}
```
