# Frontend — RAG Demo

A minimal static frontend that talks to the backend at `/ingest` and `/query`.

Quick start

```bash
# serve frontend on port 8080 (from repo root)
python -m http.server 8080 --directory frontend
# or open frontend/index.html directly in a browser
```

If you serve frontend from a different origin, enable CORS in the backend or proxy requests.
