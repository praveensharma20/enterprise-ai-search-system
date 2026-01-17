# Backend — RAG Demo

This folder contains the FastAPI backend for the RAG demo.

Quick start

1. Create a virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and adjust settings.

3. Run the app:

```bash
uvicorn backend.app.main:app --reload --port 8000
```

Notes
- The FAISS index is in-memory in this demo. For production, persist the index and document metadata.
- See `config.py` for environment variables.
