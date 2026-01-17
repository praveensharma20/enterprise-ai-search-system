# backend/app/document_processor.py

import PyPDF2
import docx
from typing import List, Dict
import logging
import re
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Process and chunk documents for embedding"""
    
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 50):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from various document formats"""
        try:
            if file_type == "application/pdf" or file_path.endswith('.pdf'):
                return self._extract_from_pdf(file_path)
            elif file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" or file_path.endswith('.docx'):
                return self._extract_from_docx(file_path)
            elif file_type == "text/plain" or file_path.endswith('.txt'):
                return self._extract_from_txt(file_path)
            else:
                logger.warning(f"Unsupported file type: {file_type}")
                return ""
                
        except Exception as e:
            logger.error(f"Error extracting text: {e}")
            raise
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text += f"\n--- Page {page_num + 1} ---\n{page_text}"
            
            logger.info(f"✅ Extracted {len(text)} characters from PDF")
            return text
            
        except Exception as e:
            logger.error(f"Error reading PDF: {e}")
            raise
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = docx.Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            
            logger.info(f"✅ Extracted {len(text)} characters from DOCX")
            return text
            
        except Exception as e:
            logger.error(f"Error reading DOCX: {e}")
            raise
    
    def _extract_from_txt(self, file_path: str) -> str:
        """Extract text from TXT"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            
            logger.info(f"✅ Extracted {len(text)} characters from TXT")
            return text
            
        except Exception as e:
            logger.error(f"Error reading TXT: {e}")
            raise
    
    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s.,!?;:()\-\'\"]+', '', text)
        
        # Remove multiple newlines
        text = re.sub(r'\n+', '\n', text)
        
        return text.strip()
    
    def chunk_text(self, text: str) -> List[Dict[str, any]]:
        """Split text into overlapping chunks"""
        # Clean text first
        text = self.clean_text(text)
        
        # Split by sentences for better semantic chunks
        sentences = re.split(r'(?<=[.!?])\s+', text)
        
        chunks = []
        current_chunk = ""
        current_size = 0
        chunk_id = 0
        
        for sentence in sentences:
            sentence_size = len(sentence.split())
            
            # If adding this sentence exceeds chunk size, save current chunk
            if current_size + sentence_size > self.chunk_size and current_chunk:
                chunks.append({
                    "chunk_id": chunk_id,
                    "content": current_chunk.strip(),
                    "word_count": current_size
                })
                
                # Start new chunk with overlap
                overlap_text = ' '.join(current_chunk.split()[-self.chunk_overlap:])
                current_chunk = overlap_text + " " + sentence
                current_size = len(current_chunk.split())
                chunk_id += 1
            else:
                current_chunk += " " + sentence
                current_size += sentence_size
        
        # Add the last chunk
        if current_chunk.strip():
            chunks.append({
                "chunk_id": chunk_id,
                "content": current_chunk.strip(),
                "word_count": current_size
            })
        
        logger.info(f"✅ Created {len(chunks)} chunks from document")
        return chunks
    
    def process_document(self, file_path: str, file_type: str) -> List[Dict[str, any]]:
        """Complete document processing pipeline"""
        try:
            # Extract text
            text = self.extract_text(file_path, file_type)
            
            if not text or len(text.strip()) < 10:
                raise ValueError("Extracted text is too short or empty")
            
            # Chunk text
            chunks = self.chunk_text(text)
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error processing document: {e}")
            raise
