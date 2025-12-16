# backend/app/config.py

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application configuration settings"""
    
    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"  # Added default
    database_name: str = "document_search"
    collection_name: str = "document_chunks"
    
    # OpenAI Configuration (optional if using Gemini)
    openai_api_key: Optional[str] = None  # Made optional
    
    # Groq Configuration (optional - for faster LLM)
    groq_api_key: Optional[str] = None
    
    # Gemini API (your existing)
    gemini_api_key: Optional[str] = None
    
    # Application Settings
    max_file_size: int = 10485760  # 10MB
    chunk_size: int = 500
    chunk_overlap: int = 50
    embedding_model: str = "text-embedding-3-small"
    embedding_dimensions: int = 1536
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Search Configuration
    top_k_results: int = 5
    similarity_threshold: float = 0.7
    
    # ✅ NEW: Authentication Settings
    secret_key: str = "praveen-sharma-enterprise-ai-search-super-secret-key-2025-giet-university"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    
    # ✅ NEW: Google OAuth
    google_client_id: str = "your-google-client-id"
    google_client_secret: str = "your-google-client-secret"
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    
    # ✅ NEW: Frontend URL
    frontend_url: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"  # Allow extra fields

# Create global settings instance
settings = Settings()
