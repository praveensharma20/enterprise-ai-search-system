# backend/app/embedding_service.py

from sentence_transformers import SentenceTransformer
from typing import List
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmbeddingService:
    """Generate embeddings using local Sentence Transformers (FREE - No API key needed)"""
    
    def __init__(self):
        # Defer heavy model load until first use to speed up API startup
        self.model = None
        self.dimensions = None
        logger.info("EmbeddingService initialized (model load deferred)")

    def _ensure_model_loaded(self):
        if self.model is None:
            logger.info("Loading local embedding model on first use...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            # set dimensions after model is loaded
            try:
                sample = self.model.encode("test")
                self.dimensions = len(sample)
            except Exception:
                self.dimensions = 384
            logger.info("✅ Local embedding model loaded successfully!")
    
    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for a single text"""
        try:
            # lazy-load model if required
            self._ensure_model_loaded()

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
            # lazy-load model if required
            self._ensure_model_loaded()

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
            "dimensions": self.dimensions or 384,
            "type": "local",
            "provider": "sentence-transformers",
            "loaded": bool(self.model is not None)
        }

# Global embedding service instance (won't load model until used)
embedding_service = EmbeddingService()
