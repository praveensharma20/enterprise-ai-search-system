# backend/app/config.py

from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    """Application configuration settings"""
    
    # MongoDB Configuration
    mongodb_url: str
    database_name: str = "document_search"
    collection_name: str = "document_chunks"
    
    # OpenAI Configuration
    openai_api_key: str
    
    # Groq Configuration (optional - for faster LLM)
    groq_api_key: Optional[str] = None
    
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
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Create global settings instance
settings = Settings()
