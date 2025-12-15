# backend/app/search_service.py

from typing import List, Dict
import logging
import numpy as np
from app.database import db
from app.embedding_service import embedding_service
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SearchService:
    """Handle semantic search operations"""
    
    def __init__(self):
        self.top_k = settings.top_k_results
        # Lower threshold for local embeddings (they produce lower scores)
        self.similarity_threshold = 0.10  # Changed from settings.similarity_threshold
        logger.info(f"🔍 Search service initialized with threshold: {self.similarity_threshold}")
    
    def cosine_similarity(self, vec1: List[float], vec2: List[float]) -> float:
        """Calculate cosine similarity between two vectors"""
        try:
            vec1_np = np.array(vec1)
            vec2_np = np.array(vec2)
            
            dot_product = np.dot(vec1_np, vec2_np)
            norm1 = np.linalg.norm(vec1_np)
            norm2 = np.linalg.norm(vec2_np)
            
            similarity = dot_product / (norm1 * norm2)
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Error calculating cosine similarity: {e}")
            return 0.0
    
    def search(self, query: str, top_k: int = None) -> List[Dict]:
        """Perform semantic search"""
        try:
            if top_k is None:
                top_k = self.top_k
            
            # Generate embedding for query
            logger.info(f"🔍 Searching for: '{query}'")
            query_embedding = embedding_service.generate_embedding(query)
            
            # Perform vector search in MongoDB
            results = db.vector_search(query_embedding, top_k=top_k * 2)  # Get more for filtering
            
            # Calculate similarity scores and filter
            scored_results = []
            for result in results:
                # Get similarity score (already calculated in database.py)
                similarity = result.get('similarity_score', 0.0)
                
                # Filter by lowered threshold (0.10 = 10%)
                if similarity >= self.similarity_threshold:
                    scored_results.append(result)
                    logger.info(f"  ✓ Match: {result.get('file_name', 'Unknown')} - Score: {similarity:.4f}")
            
            # Sort by similarity score
            scored_results.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top-k results
            final_results = scored_results[:top_k]
            
            if final_results:
                logger.info(f"✅ Found {len(final_results)} relevant results (threshold: {self.similarity_threshold})")
            else:
                logger.warning(f"⚠️  No results above threshold {self.similarity_threshold}")
            
            return final_results
            
        except Exception as e:
            logger.error(f"Search error: {e}")
            raise
    
    def hybrid_search(self, query: str, top_k: int = None) -> List[Dict]:
        """Perform hybrid search (semantic + keyword)"""
        try:
            if top_k is None:
                top_k = self.top_k
            
            # Semantic search
            semantic_results = self.search(query, top_k=top_k)
            
            # Keyword search (simple text matching)
            keyword_results = self._keyword_search(query, top_k=top_k)
            
            # Merge and re-rank results
            merged_results = self._merge_results(
                semantic_results, 
                keyword_results,
                semantic_weight=0.7,
                keyword_weight=0.3
            )
            
            return merged_results[:top_k]
            
        except Exception as e:
            logger.error(f"Hybrid search error: {e}")
            return self.search(query, top_k)  # Fallback to semantic search
    
    def _keyword_search(self, query: str, top_k: int) -> List[Dict]:
        """Simple keyword-based search"""
        try:
            # MongoDB text search
            results = list(db.collection.find(
                {"$text": {"$search": query}},
                {"score": {"$meta": "textScore"}}
            ).sort([("score", {"$meta": "textScore"})]).limit(top_k))
            
            for result in results:
                result['similarity_score'] = result.get('score', 0.5) / 10  # Normalize
            
            return results
            
        except Exception as e:
            logger.warning(f"Keyword search failed: {e}")
            return []
    
    def _merge_results(self, semantic_results: List[Dict], keyword_results: List[Dict],
                       semantic_weight: float, keyword_weight: float) -> List[Dict]:
        """Merge and re-rank results from different search methods"""
        merged = {}
        
        # Add semantic results
        for result in semantic_results:
            doc_id = result.get('document_id', '') + str(result.get('chunk_id', ''))
            merged[doc_id] = result.copy()
            merged[doc_id]['final_score'] = result['similarity_score'] * semantic_weight
        
        # Add keyword results
        for result in keyword_results:
            doc_id = result.get('document_id', '') + str(result.get('chunk_id', ''))
            if doc_id in merged:
                merged[doc_id]['final_score'] += result['similarity_score'] * keyword_weight
            else:
                merged[doc_id] = result.copy()
                merged[doc_id]['final_score'] = result['similarity_score'] * keyword_weight
        
        # Sort by final score
        final_results = list(merged.values())
        final_results.sort(key=lambda x: x.get('final_score', 0), reverse=True)
        
        return final_results

# Global search service instance
search_service = SearchService()
