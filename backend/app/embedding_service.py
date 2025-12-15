# backend/app/embedding_service.py

from sentence_transformers import SentenceTransformer
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingService:
    """Generate embeddings using local Sentence Transformers (FREE - No API key needed)"""
    
    def __init__(self):
        # Use free local model - no API key required!
        logger.info("Loading local embedding model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.dimensions = 384  # Model dimension
        logger.info("✅ Local embedding model loaded successfully!")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        try:
            text = text.replace("\n", " ").strip()
            
            if len(text) == 0:
                raise ValueError("Text is empty")
            
            embedding = self.model.encode(text)
            
            logger.info(f"✅ Generated embedding of dimension {len(embedding)}")
            return embedding.tolist()
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for multiple texts"""
        try:
            cleaned_texts = [text.replace("\n", " ").strip() for text in texts]
            cleaned_texts = [text for text in cleaned_texts if text]
            
            if not cleaned_texts:
                raise ValueError("No valid texts to embed")
            
            embeddings = self.model.encode(cleaned_texts)
            
            logger.info(f"✅ Generated {len(embeddings)} embeddings in batch")
            return [emb.tolist() for emb in embeddings]
            
        except Exception as e:
            logger.error(f"Error generating batch embeddings: {e}")
            raise
    
    def get_embedding_info(self) -> dict:
        """Get information about the embedding model"""
        return {
            "model": "all-MiniLM-L6-v2",
            "dimensions": 384,
            "type": "local",
            "provider": "sentence-transformers"
        }

# Global embedding service instance
embedding_service = EmbeddingService()
