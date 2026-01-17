# backend/app/rag_service.py

from typing import List, Dict, Optional
import logging
from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RAGService:
    """Retrieval-Augmented Generation service"""
    
    def __init__(self):
        self.model = None
        self.use_llm = False
        
        # Try to initialize Gemini
        logger.info(f"🔑 Checking for Gemini API key: {bool(settings.gemini_api_key)}")
        
        if settings.gemini_api_key:
            try:
                import google.generativeai as genai
                logger.info("📦 Configuring Gemini API...")
                genai.configure(api_key=settings.gemini_api_key)
                self.model = genai.GenerativeModel('models/gemini-2.5-flash')
                self.use_llm = True
                logger.info("✅ RAG service initialized with Gemini AI")
                logger.info(f"✅ Model ready: {self.model is not None}")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini: {e}", exc_info=True)
                logger.info("💡 Falling back to summary mode")
        else:
            logger.warning("⚠️  RAG service initialized without LLM (API keys not configured)")
            logger.info("💡 Search will work, but AI answer generation will be disabled")
    
    def generate_answer(self, query: str, search_results: List[Dict]) -> str:
        """Generate answer using LLM or fallback to summary"""
        try:
            if not search_results:
                return "No relevant information found in the documents."
            
            # Debug logging
            logger.info(f"🤖 Generate answer called - use_llm: {self.use_llm}, model: {self.model is not None}")
            
            # Use LLM if available
            if self.use_llm and self.model:
                logger.info("✅ Calling Gemini to generate answer...")
                answer = self._generate_answer_with_llm(query, search_results)
                logger.info(f"✅ Gemini response received: {len(answer)} characters")
                return answer
            else:
                logger.info("⚠️  Falling back to summary mode (no LLM available)")
                return self._generate_summary_without_llm(query, search_results)
            
        except Exception as e:
            logger.error(f"❌ Error in generate_answer: {e}", exc_info=True)
            return self._generate_summary_without_llm(query, search_results)
    
    def _generate_answer_with_llm(self, query: str, search_results: List[Dict]) -> str:
        """Generate answer using Gemini AI"""
        try:
            logger.info(f"📝 Preparing context from {len(search_results)} results...")
            
            # Prepare context from search results
            context = "\n\n".join([
                f"Document: {result.get('file_name', 'Unknown')}\n{result.get('content', '')[:500]}"
                for result in search_results[:5]
            ])
            
            # Create prompt
            prompt = f"""Based on the following documents, answer the user's question.
Be concise, accurate, and helpful. If the documents don't contain enough information, say so.

Question: {query}

Documents:
{context}

Answer:"""
            
            logger.info("🚀 Sending request to Gemini API...")
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            if response and response.text:
                logger.info("✅ Gemini API response received successfully")
                return response.text
            else:
                logger.warning("⚠️  Gemini returned empty response")
                return self._generate_summary_without_llm(query, search_results)
            
        except Exception as e:
            logger.error(f"❌ Error with Gemini API: {e}", exc_info=True)
            # Fallback to summary
            return self._generate_summary_without_llm(query, search_results)
    
    def _generate_summary_without_llm(self, query: str, search_results: List[Dict]) -> str:
        """Create a formatted summary from search results"""
        logger.info("📋 Generating summary without LLM...")
        
        summary = f"Found {len(search_results)} relevant document(s) for your query:\n\n"
        
        for idx, result in enumerate(search_results[:3], 1):  # Top 3 results
            content = result.get('content', '')[:300]  # First 300 chars
            file_name = result.get('file_name', 'Unknown')
            similarity = result.get('similarity_score', 0)
            
            summary += f"📄 Source {idx}: {file_name} ({similarity*100:.1f}% match)\n"
            summary += f"{content}...\n\n"
        
        summary += "💡 Tip: Enable Gemini API for AI-generated answers!"
        return summary
    
    def generate_summary(self, text: str, max_length: int = 200) -> str:
        """Generate a summary of text"""
        if self.use_llm and self.model:
            try:
                prompt = f"Summarize the following text in {max_length} characters or less:\n\n{text}"
                response = self.model.generate_content(prompt)
                return response.text
            except Exception as e:
                logger.error(f"Error in generate_summary: {e}")
                pass
        
        # Fallback: simple truncation
        return text[:max_length] + "..." if len(text) > max_length else text

# Global RAG service instance
rag_service = RAGService()
