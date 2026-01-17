# backend/app/main.py

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import uuid
import time
from datetime import datetime
from typing import List
import logging

from app.config import settings
from app.models import (
    DocumentUploadResponse, SearchQuery, SearchResponse, 
    SearchResult, HealthCheckResponse, DocumentListResponse,
    DocumentMetadata
)
from app.database import db
from app.document_processor import DocumentProcessor
from app.embedding_service import embedding_service
from app.search_service import search_service
from app.rag_service import rag_service

# ✅ Import auth routes
from app.auth import routes as auth_routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Enterprise AI Search System",
    description="AI-powered document search with RAG and authentication",
    version="1.0.0"
)

# ✅ ENHANCED CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"]  # Expose all headers
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Initialize document processor
doc_processor = DocumentProcessor(
    chunk_size=settings.chunk_size,
    chunk_overlap=settings.chunk_overlap
)

# ✅ Setup auth router
app.include_router(auth_routes.router)

@app.on_event("startup")
async def startup_event():
    """Connect to database on startup"""
    logger.info("🚀 Starting Enterprise AI Search System...")
    db.connect()
    logger.info("✅ API is ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Close database connection on shutdown"""
    logger.info("👋 Shutting down...")
    db.close()

@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "message": "Enterprise AI Search System API",
        "version": "1.0.0",
        "status": "running",
        "features": ["Document Upload", "Semantic Search", "RAG", "Authentication"]
    }

@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    try:
        # Check database connection
        db.client.admin.command('ping')
        db_connected = True
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_connected = False
    
    return HealthCheckResponse(
        status="healthy" if db_connected else "unhealthy",
        database_connected=db_connected,
        timestamp=datetime.utcnow()
    )

@app.post("/upload", response_model=DocumentUploadResponse, tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Upload and process a document"""
    start_time = time.time()
    file_path = None
    
    try:
        # Validate file type
        allowed_types = ["application/pdf", "text/plain", 
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
        
        if file.content_type not in allowed_types and not any(
            file.filename.endswith(ext) for ext in ['.pdf', '.txt', '.docx']
        ):
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Only PDF, TXT, and DOCX are supported."
            )
        
        # Check file size
        contents = await file.read()
        if len(contents) > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Max size: {settings.max_file_size / 1024 / 1024}MB"
            )
        
        # Save file temporarily
        document_id = str(uuid.uuid4())
        file_path = os.path.join(UPLOAD_DIR, f"{document_id}_{file.filename}")
        
        with open(file_path, "wb") as f:
            f.write(contents)
        
        logger.info(f"📄 Processing document: {file.filename}")
        
        # Process document (extract and chunk)
        chunks = doc_processor.process_document(file_path, file.content_type)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Could not extract text from document"
            )
        
        # Generate embeddings for chunks
        chunk_texts = [chunk['content'] for chunk in chunks]
        embeddings = embedding_service.generate_embeddings_batch(chunk_texts)
        
        # Prepare data for database
        chunks_data = []
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            chunk_data = {
                "document_id": document_id,
                "file_name": file.filename,
                "chunk_id": chunk['chunk_id'],
                "content": chunk['content'],
                "embedding": embedding,
                "metadata": {
                    "word_count": chunk.get('word_count', 0),
                    "file_size": len(contents)
                },
                "created_at": datetime.utcnow()
            }
            chunks_data.append(chunk_data)
        
        # Insert into database
        db.insert_chunks(chunks_data)
        
        # Clean up temporary file
        if os.path.exists(file_path):
            os.remove(file_path)
        
        processing_time = time.time() - start_time
        
        logger.info(f"✅ Document processed successfully in {processing_time:.2f}s")
        
        return DocumentUploadResponse(
            success=True,
            message="Document uploaded and processed successfully",
            document_id=document_id,
            file_name=file.filename,
            chunks_created=len(chunks),
            processing_time=round(processing_time, 2)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error uploading document: {e}", exc_info=True)
        # Clean up file if it exists
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.post("/search", response_model=SearchResponse, tags=["Search"])
async def search_documents(search_query: SearchQuery):
    """Search documents using semantic search"""
    start_time = time.time()
    
    try:
        query = search_query.query
        top_k = search_query.top_k or settings.top_k_results
        use_rag = search_query.use_rag
        
        logger.info(f"🔍 Searching for: '{query}'")
        
        # Perform search
        results = search_service.search(query, top_k=top_k)
        
        # Format results
        search_results = [
            SearchResult(
                content=result.get('content', ''),
                file_name=result.get('file_name', 'Unknown'),
                chunk_id=result.get('chunk_id', 0),
                similarity_score=round(result.get('similarity_score', 0.0), 4),
                metadata=result.get('metadata', {})
            )
            for result in results
        ]
        
        # Generate RAG answer if requested
        rag_answer = None
        if use_rag and results:
            rag_answer = rag_service.generate_answer(query, results)
        
        processing_time = time.time() - start_time
        
        return SearchResponse(
            query=query,
            results=search_results,
            total_results=len(search_results),
            processing_time=round(processing_time, 2),
            rag_answer=rag_answer
        )
        
    except Exception as e:
        logger.error(f"❌ Search error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@app.get("/documents", response_model=DocumentListResponse, tags=["Documents"])
async def list_documents():
    """Get list of all uploaded documents"""
    try:
        logger.info("📋 Fetching documents list...")
        documents = db.get_all_documents()
        
        doc_list = [
            DocumentMetadata(
                document_id=doc['_id'],
                file_name=doc.get('file_name', 'Unknown'),
                file_size=0,
                upload_date=doc.get('upload_date', datetime.utcnow()),
                total_chunks=doc.get('total_chunks', 0)
            )
            for doc in documents
        ]
        
        logger.info(f"✅ Found {len(doc_list)} documents")
        
        return DocumentListResponse(
            documents=doc_list,
            total_count=len(doc_list)
        )
        
    except Exception as e:
        logger.error(f"❌ Error listing documents: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list documents: {str(e)}")

@app.delete("/documents/{document_id}", tags=["Documents"])
async def delete_document(document_id: str):
    """Delete a document and all its chunks"""
    try:
        logger.info(f"🗑️  Deleting document: {document_id}")
        deleted_count = db.delete_document(document_id)
        
        if deleted_count == 0:
            raise HTTPException(status_code=404, detail="Document not found")
        
        logger.info(f"✅ Deleted {deleted_count} chunks")
        
        return {
            "success": True,
            "message": f"Document deleted successfully",
            "chunks_deleted": deleted_count
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error deleting document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@app.get("/info", tags=["Info"])
async def get_info():
    """Get system information"""
    return {
        "embedding_model": settings.embedding_model,
        "embedding_dimensions": settings.embedding_dimensions,
        "chunk_size": settings.chunk_size,
        "chunk_overlap": settings.chunk_overlap,
        "max_file_size_mb": settings.max_file_size / 1024 / 1024,
        "supported_formats": ["PDF", "TXT", "DOCX"],
        "cors_enabled": True,
        "api_version": "1.0.0"
    }


@app.get("/analytics/stats", tags=["Analytics"])
async def analytics_stats():
    """Return basic analytics stats for the frontend dashboard"""
    try:
        # If DB not connected, return sensible defaults
        if db.collection is None:
            return {
                "total_documents": 0,
                "total_searches": 0,
                "documents_by_type": [],
                "recent_searches": []
            }

        # Total unique documents (grouped by document_id)
        unique_docs = db.collection.distinct("document_id")
        total_documents = len(unique_docs) if unique_docs else 0

        # Documents by file extension (count chunks per extension as approximation)
        docs = list(db.collection.find({}, {"file_name": 1}))
        from os.path import splitext
        types_count = {}
        for d in docs:
            fname = d.get('file_name') or ''
            ext = splitext(fname)[1].lower() if fname else 'unknown'
            types_count[ext] = types_count.get(ext, 0) + 1

        documents_by_type = [{"type": k if k else "unknown", "count": v} for k, v in types_count.items()]

        # Recent searches: not tracked yet, return empty list
        recent_searches = []

        # Total searches placeholder (could be implemented by logging searches)
        total_searches = 0

        return {
            "total_documents": total_documents,
            "total_searches": total_searches,
            "documents_by_type": documents_by_type,
            "recent_searches": recent_searches
        }

    except Exception as e:
        logger.error(f"❌ Analytics endpoint error: {e}", exc_info=True)
        # Return the error message in the response to aid local debugging
        return JSONResponse(status_code=500, content={"detail": f"Failed to compute analytics stats: {str(e)}"})

# ✅ Add OPTIONS handler for preflight requests
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight requests"""
    return JSONResponse(
        content={"message": "OK"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
