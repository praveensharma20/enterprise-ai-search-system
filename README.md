# 🔍 Enterprise AI Search System

> AI-powered semantic document search engine with RAG capabilities, JWT authentication, and modern UI

![Python](https://img.shields.io/badge/Python-3.12+-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-darkgreen?style=for-the-badge&logo=mongodb)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

An intelligent document search system that uses semantic embeddings, vector search, and Retrieval-Augmented Generation (RAG) to provide accurate, context-aware answers from your document library.

[🚀 Live Demo](#) | [📖 Documentation](#-features) | [🐛 Report Bug](https://github.com/praveensharma20/enterprise-ai-search/issues)

---

## ✨ Features

### 🤖 **AI-Powered Intelligence**
- **Semantic Search**: Find information by meaning, not just keywords
- **RAG Technology**: Get accurate AI-generated answers from your documents
- **Vector Embeddings**: Using sentence-transformers for local embedding generation
- **Multi-Format Support**: PDF, DOCX, and TXT files
- **Smart Chunking**: Intelligent document segmentation with overlap

### 🔐 **Security & Authentication**
- **JWT Authentication**: Secure token-based user authentication
- **Password Security**: Bcrypt hashing for password protection
- **Protected Routes**: Role-based access control
- **Session Management**: Persistent login sessions

### 📊 **Document Management**
- **Upload & Process**: Automatic text extraction and indexing
- **Real-time Search**: Sub-second query responses
- **Document Library**: View, manage, and delete documents
- **Storage Tracking**: Monitor document count and storage usage

### 🎨 **Modern User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode**: Eye-friendly dark theme support
- **Real-time Notifications**: User feedback for all actions
- **Gradient UI**: Beautiful, modern interface design

---

## 🏗️ Architecture

┌─────────────────┐
│ Frontend │ HTML/CSS/JS
│ (Static Files) │
└────────┬────────┘
│ HTTPS
▼
┌─────────────────┐
│ FastAPI │ REST API
│ Backend │ JWT Auth
└────────┬────────┘
│
┌────┴────┬──────────┐
▼ ▼ ▼
┌────────┐ ┌──────┐ ┌─────────┐
│MongoDB │ │ NLP │ │ Gemini │
│ Atlas │ │Model │ │ API │
└────────┘ └──────┘ └─────────┘


---

## 📁 Project Structure

rag_app/
├── backend/
│ ├── app/
│ │ ├── auth/ # 🔐 Authentication module
│ │ │ ├── init.py
│ │ │ ├── models.py # User data models
│ │ │ ├── routes.py # Auth API endpoints
│ │ │ ├── schemas.py # Request/response schemas
│ │ │ └── utils.py # JWT & password utilities
│ │ ├── main.py # FastAPI application
│ │ ├── config.py # Configuration settings
│ │ ├── database.py # MongoDB connection
│ │ ├── models.py # Document models
│ │ ├── document_processor.py # PDF/DOCX/TXT processing
│ │ ├── embedding_service.py # Vector embeddings
│ │ ├── search_service.py # Semantic search
│ │ └── rag_service.py # RAG answer generation
│ ├── uploads/ # Temporary file storage
│ ├── venv/ # Python virtual environment
│ ├── requirements.txt # Python dependencies
│ └── .env # Environment variables
├── frontend/
│ ├── index.html # Landing page
│ ├── pages/
│ │ ├── login.html # User login
│ │ ├── signup.html # User registration
│ │ └── dashboard.html # Main application
│ ├── css/
│ │ ├── style.css # Landing page styles
│ │ ├── auth.css # Authentication styles
│ │ └── dashboard.css # Dashboard styles
│ └── js/
│ ├── auth.js # Auth logic
│ └── dashboard.js # Dashboard functionality
├── .gitignore
└── README.md


---

## 🚀 Quick Start

### Prerequisites

- **Python 3.12+**
- **MongoDB** (local or Atlas)
- **Git**

### 1️⃣ Clone Repository

git clone https://github.com/praveensharma20/enterprise-ai-search.git
cd enterprise-ai-search


### 2️⃣ Backend Setup

cd backend

Create virtual environment
python3 -m venv venv
source venv/bin/activate # Windows: venv\Scripts\activate

Install dependencies
pip install -r requirements.txt

Create environment file
cp .env.example .env
nano .env # Edit with your settings


**Required `.env` Configuration:**
Database
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=document_search
COLLECTION_NAME=document_chunks

JWT Authentication
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OpenAI (Optional - for embeddings)
OPENAI_API_KEY=sk-your-openai-key

Groq (Optional - for faster LLM)
GROQ_API_KEY=gsk_your-groq-key

Gemini (Optional - for AI answers)
GEMINI_API_KEY=your-gemini-key

Server
HOST=0.0.0.0
PORT=8000


### 3️⃣ Start MongoDB

Ubuntu/Linux
sudo systemctl start mongod
sudo systemctl enable mongod

Verify
mongosh --eval "db.adminCommand('ping')"


### 4️⃣ Run Backend

cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000


✅ Backend running at: [**http://localhost:8000**](http://localhost:8000)

✅ API Docs: [**http://localhost:8000/docs**](http://localhost:8000/docs)

### 5️⃣ Open Frontend

cd frontend

Option 1: Direct open
xdg-open index.html # Linux
open index.html # macOS

Option 2: Python server
python3 -m http.server 3000

Option 3: Node.js serve
npx serve


✅ Frontend: [**http://localhost:3000**](http://localhost:3000) (if using server)

---

## 📖 Usage Guide

### 1. **Create Account**
- Navigate to signup page
- Enter full name, email, and password
- Click "Create Account"

### 2. **Login**
- Enter your credentials
- Get JWT token automatically
- Redirected to dashboard

### 3. **Upload Documents**
- Click "Upload Document" button
- Select PDF, DOCX, or TXT file (max 10MB)
- Wait for processing notification
- Document appears in library

### 4. **Search Documents**
- Enter your question in the search bar
- Press Enter or click Search
- View AI-generated answer
- See relevant document chunks with similarity scores

### 5. **Manage Documents**
- View all documents in Documents section
- See chunk count and upload date
- Delete unwanted documents
- Track total documents uploaded

### 6. **Logout**
- Click logout button in sidebar
- Confirm logout
- Redirected to login page

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login user | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/logout` | Logout user | ✅ |

### Documents

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload document | ❌ |
| GET | `/documents` | List all documents | ❌ |
| DELETE | `/documents/{id}` | Delete document | ❌ |

### Search

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/search` | Semantic search | ❌ |

### System

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | ❌ |
| GET | `/info` | System information | ❌ |

---

## 🧪 Testing

### Test Signup (cURL)

curl -X POST "http://localhost:8000/api/auth/signup"
-H "Content-Type: application/json"
-d '{
"full_name": "Test User",
"email": "test@example.com",
"password": "SecurePass123"
}'


### Test Login

curl -X POST "http://localhost:8000/api/auth/login"
-H "Content-Type: application/json"
-d '{
"email": "test@example.com",
"password": "SecurePass123"
}'


### Test Document Upload

curl -X POST "http://localhost:8000/upload"
-F "file=@sample.pdf"


### Test Search

curl -X POST "http://localhost:8000/search"
-H "Content-Type: application/json"
-d '{
"query": "What is machine learning?",
"top_k": 5,
"use_rag": true
}'


---

## 🛠️ Configuration

### Chunking Strategy

Edit in `config.py`:

chunk_size = 500 # Words per chunk
chunk_overlap = 50 # Overlap between chunks


### Search Parameters

top_k_results = 5 # Number of results
similarity_threshold = 0.7 # Minimum score


---

## 🐛 Troubleshooting

### MongoDB Connection Failed
- ✅ Check `MONGODB_URL` in `.env`
- ✅ Verify MongoDB is running: `sudo systemctl status mongod`
- ✅ Test connection: `mongosh`

### Authentication Not Working
- ✅ Check `SECRET_KEY` is set in `.env`
- ✅ Clear browser localStorage
- ✅ Check backend logs for errors

### Search Returns No Results
- ✅ Upload documents first
- ✅ Wait for processing to complete
- ✅ Check embedding model is loaded

### File Upload Fails
- ✅ Check file size < 10MB
- ✅ Verify file type (PDF/DOCX/TXT)
- ✅ Check `uploads/` directory permissions

---

## 🎓 Educational Project

**Institution:** GIET University, Gunupur, Odisha  
**Program:** Computer Science Engineering (6th Semester)  
**Developer:** Praveen Sharma

### Learning Outcomes
✅ Full-stack web development  
✅ AI/ML integration (RAG, embeddings)  
✅ RESTful API design with FastAPI  
✅ Database management (MongoDB)  
✅ JWT authentication & security  
✅ Modern UI/UX development  

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👨‍💻 Author

**Praveen Sharma**

- 🐙 GitHub: [@praveensharma20](https://github.com/praveensharma20)
- 💼 LinkedIn: [Praveen Kumar](https://www.linkedin.com/in/praveen-kumar1828/)
- 📧 Email: praveenjit8484@gmail.com
- 🏫 Institution: GIET University, Odisha

---

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [MongoDB](https://www.mongodb.com/) - Flexible document database
- [Sentence Transformers](https://www.sbert.net/) - State-of-the-art embeddings
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI language model
- [Font Awesome](https://fontawesome.com/) - Beautiful icons

---

## 📞 Support

- 📧 Email: praveenjit8484@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/praveensharma20/enterprise-ai-search/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/praveensharma20/enterprise-ai-search/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by Praveen Sharma | GIET University

[⬆ Back to Top](#-enterprise-ai-search-system)

</div>

