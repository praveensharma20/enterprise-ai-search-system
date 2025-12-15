# RAG Demo Project

Minimal Retrieval-Augmented Generation (RAG) demo using a FastAPI backend and a simple static frontend.
Repository layout

```
Quick start (local Python)

1. Create a virtualenv and install dependencies:
```bash
python -m venv .venv
source .venv/bin/activate
2. Copy `.env.example` to `backend/.env` and adjust settings.

3. Run the backend:
```bash
uvicorn backend.app.main:app --reload --port 8000
```
4. Serve the frontend (from repo root):

```bash
python -m http.server 8080 --directory frontend
```
Docker

```bash
docker-compose up --build
```
Notes
- The FAISS index and document metadata are kept in-memory for this demo. Persist the index and DB for production.
- See `backend/README.md` and `frontend/README.md` for more details.

License

This project is provided under the MIT license. See the `LICENSE` file.
# Enterprise AI Search System

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

AI-powered semantic document search engine with RAG capabilities.

[View Live Demo](#) | [Documentation](#installation)


# 🔍 Semantic Document Search Engine

An AI-powered document search engine using semantic search, vector embeddings, and Retrieval-Augmented Generation (RAG) for intelligent information retrieval from enterprise documents.

![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Features

- **Semantic Search**: Find documents by meaning, not just keywords
- **AI-Powered Answers**: RAG-based answer generation using Groq/OpenAI
- **Multi-Format Support**: PDF, DOCX, TXT files
- **Vector Embeddings**: OpenAI embeddings for semantic understanding
- **Fast Search**: MongoDB Atlas Vector Search for sub-second queries
- **Modern UI**: Clean, responsive web interface
- **Document Management**: Upload, view, and delete documents
- **Real-time Processing**: Async document processing with progress tracking

## 🏗️ Architecture

┌─────────────┐
│ Frontend │ (HTML/CSS/JS)
# RAG Demo

Minimal Retrieval-Augmented Generation (RAG) demo that demonstrates semantic search and simple RAG workflows.

Key points
- Backend: FastAPI + SQLAlchemy + FAISS (in-memory index)
- Frontend: Minimal static HTML/CSS/JS demo
- Purpose: educational/demo — not production-ready

Repository structure

```
rag_app/
├─ backend/            # FastAPI app, models, services, requirements
├─ frontend/           # Static demo UI (index.html, style.css, script.js)
├─ Makefile            # Convenience commands (venv, run, docker)
├─ docker-compose.yml  # Local compose for backend + static frontend
├─ LICENSE
├─ CONTRIBUTING.md
└─ README.md           # This file
```

Quick start (local Python)

1. Create a virtual environment and install dependencies

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

2. Copy example env and adjust

```bash
cp backend/.env.example backend/.env
# edit backend/.env as needed
```

3. Run backend (development)

```bash
uvicorn backend.app.main:app --reload --port 8000
```

4. Serve frontend (simple static server)

```bash
python -m http.server 8080 --directory frontend
# then open http://localhost:8080
```

Docker (optional)

```bash
docker-compose up --build
```

Helpful targets (Makefile)

```bash
make venv        # create virtualenv
make install     # install backend deps into .venv
make run-backend # run uvicorn
make run-frontend# serve frontend on :8080
```

Notes
- The FAISS index is currently in-memory; for production persist the index and metadata.
- Add CORS, authentication, and proper error handling before deploying.

Contributing

See `CONTRIBUTING.md` for contribution guidelines. Keep changes focused and include tests where appropriate.

License

This project is licensed under the MIT License. See `LICENSE`.

Contact

If you have questions or issues, open an issue or email: praveenjit8484@gmail.com

---

If you'd like, I can now: add a simple CI workflow, enable CORS in the backend, or create a small test to verify the backend endpoints.
DATABASE_NAME=document_search
COLLECTION_NAME=document_chunks

OpenAI API Key
OPENAI_API_KEY=sk-your-openai-api-key-here

Groq API Key (optional - faster LLM)
GROQ_API_KEY=gsk_your-groq-api-key-here

Application Settings
MAX_FILE_SIZE=10485760
CHUNK_SIZE=500
CHUNK_OVERLAP=50

text

### 4. Set Up MongoDB Atlas Vector Search

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (M0 free tier is sufficient)
3. Create a database named `document_search`
4. Create a collection named `document_chunks`
5. Create a Vector Search Index:
   - Go to Atlas Search → Create Search Index
   - Choose "JSON Editor"
   - Use this configuration:

{
"mappings": {
"dynamic": true,
"fields": {
"embedding": {
"type": "knnVector",
"dimensions": 1536,
"similarity": "cosine"
}
}
}
}

text

## ▶️ Running the Application

### Start Backend Server

cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

text

Backend will run at: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Start Frontend

Open `frontend/index.html` in your browser, or use a simple HTTP server:

cd frontend

Using Python
python -m http.server 3000

Or using Node.js
npx serve

text

Frontend will run at: `http://localhost:3000`

## 🐳 Docker Deployment (Optional)

### Using Docker Compose

docker-compose up -d

text

This will start:
- Backend API on port 8000
- Frontend on port 3000

## 📖 Usage Guide

### 1. Upload Documents

- Click "Browse Files" or drag & drop documents
- Supported formats: PDF, TXT, DOCX
- Maximum file size: 10MB
- Documents are automatically processed and chunked

### 2. Search Documents

- Enter your question in natural language
- Toggle "Use AI Answer Generation" for RAG-based answers
- Adjust "Top Results" to control result count
- Click "Search" or press Enter

### 3. View Results

- **AI-Generated Answer**: Comprehensive answer from all relevant documents
- **Relevant Documents**: Individual document chunks with similarity scores
- **Source Citations**: Each result shows the source file and chunk number

### 4. Manage Documents

- View all uploaded documents in the Document Library
- See chunk count and upload date
- Delete documents when no longer needed

## 🔧 API Endpoints

### Health Check
GET /health

text

### Upload Document
POST /upload
Content-Type: multipart/form-data

file: <document_file>

text

### Search Documents
POST /search
Content-Type: application/json

{
"query": "your search query",
"top_k": 5,
"use_rag": true
}

text

### List Documents
GET /documents

text

### Delete Document
DELETE /documents/{document_id}

text

### System Info
GET /info

text

## 🛠️ Configuration

### Chunking Strategy

Edit in `config.py`:

chunk_size = 500 # Words per chunk
chunk_overlap = 50 # Overlap between chunks

text

### Embedding Model

Change in `config.py`:

embedding_model = "text-embedding-3-small" # or text-embedding-3-large
embedding_dimensions = 1536

text

### Search Parameters

top_k_results = 5 # Number of results
similarity_threshold = 0.7 # Minimum similarity score

text

## 📊 Performance Tips

1. **Batch Processing**: Upload multiple documents at once
2. **Chunk Size**: Smaller chunks (300-500 words) work best
3. **Caching**: Implement Redis for frequently searched queries
4. **Indexing**: Ensure MongoDB vector index is properly configured
5. **API Rate Limits**: Monitor OpenAI/Groq usage

## 🧪 Testing

### Test Document Upload
curl -X POST "http://localhost:8000/upload"
-H "Content-Type: multipart/form-data"
-F "file=@test.pdf"

text

### Test Search
curl -X POST "http://localhost:8000/search"
-H "Content-Type: application/json"
-d '{"query": "What is machine learning?", "top_k": 5, "use_rag": true}'

text

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check MongoDB URL in `.env`
- Ensure IP address is whitelisted in Atlas
- Verify database user has read/write permissions

### Embedding Generation Error
- Verify OpenAI API key is valid
- Check API usage limits and billing
- Ensure text is not too long (max 8191 tokens)

### Search Returns No Results
- Check if documents are uploaded
- Verify vector index is created in MongoDB
- Lower similarity threshold

### RAG Answer Not Generated
- Check Groq/OpenAI API key
- Ensure search returns results first
- Verify LLM model availability

## 📈 Future Enhancements

- [ ] Multi-language support
- [ ] Image and table extraction
- [ ] Real-time document sync
- [ ] User authentication
- [ ] Advanced filtering
- [ ] Export search results
- [ ] Analytics dashboard
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/praveensharma20)
- LinkedIn: [Your Name](https://www.linkedin.com/in/praveen-kumar1828/)

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/)
- [MongoDB Atlas](https://www.mongodb.com/atlas)
- [OpenAI](https://openai.com/)
- [Groq](https://groq.com/)
- [LangChain](https://langchain.com/)

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Email: praveenjit8484@gmail.com

---

⭐ **Star this repo if you find it helpful!**