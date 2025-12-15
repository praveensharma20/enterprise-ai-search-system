# backend/app/rag_service.py

from typing import List, Dict
import logging
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service"""
    
    def __init__(self):
        # Make OpenAI/Groq optional - won't crash if no API key
        self.use_llm = False
        logger.info("⚠️  RAG service initialized without LLM (API keys not configured)")
        logger.info("💡 Search will work, but AI answer generation will be disabled")
    
    def generate_answer(self, query: str, search_results: List[Dict]) -> str:
        """Generate answer - returns summary if no LLM available"""
        try:
            if not search_results:
                return "No relevant information found in the documents."
            
            # Since we don't have LLM, return a formatted summary
            return self._generate_summary_without_llm(query, search_results)
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return f"Error generating answer: {str(e)}"
    
    def _generate_summary_without_llm(self, query: str, search_results: List[Dict]) -> str:
        """Create a formatted summary from search results"""
        summary = f"Found {len(search_results)} relevant document(s) for your query:\n\n"
        
        for idx, result in enumerate(search_results[:3], 1):  # Top 3 results
            content = result.get('content', '')[:300]  # First 300 chars
            file_name = result.get('file_name', 'Unknown')
            similarity = result.get('similarity_score', 0)
            
            summary += f"📄 Source {idx}: {file_name} ({similarity*100:.1f}% match)\n"
            summary += f"{content}...\n\n"
        
        summary += "💡 Tip: Enable OpenAI/Groq API for AI-generated answers!"
        return summary
    
    def generate_summary(self, text: str, max_length: int = 200) -> str:
        """Generate a summary of text"""
        # Simple truncation since no LLM
        return text[:max_length] + "..." if len(text) > max_length else text

# Global RAG service instance
rag_service = RAGService()
