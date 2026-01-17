# backend/app/models.py

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    """Response model for document upload"""
    success: bool
    message: str
    document_id: str
    file_name: str
    chunks_created: int
    processing_time: float

class DocumentMetadata(BaseModel):
    """Metadata for uploaded documents"""
    file_name: str
    file_size: int
    upload_date: datetime
    total_chunks: int
    document_id: str

class ChunkData(BaseModel):
    """Model for document chunks stored in database"""
    document_id: str
    file_name: str
    chunk_id: int
    content: str
    embedding: List[float]
    metadata: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class SearchQuery(BaseModel):
    """Model for search requests"""
    query: str
    top_k: Optional[int] = 5
    use_rag: Optional[bool] = True

class SearchResult(BaseModel):
    """Model for individual search results"""
    content: str
    file_name: str
    chunk_id: int
    similarity_score: float
    metadata: Dict[str, Any] = {}

class SearchResponse(BaseModel):
    """Response model for search queries"""
    query: str
    results: List[SearchResult]
    total_results: int
    processing_time: float
    rag_answer: Optional[str] = None

class DocumentListResponse(BaseModel):
    """Response for listing all documents"""
    documents: List[DocumentMetadata]
    total_count: int

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    database_connected: bool
    timestamp: datetime
