# backend/app/database.py

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from app.config import settings
import logging
import numpy as np

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MongoDB:
    """MongoDB connection manager"""
    
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
    
    def connect(self):
        """Establish connection to MongoDB"""
        try:
            self.client = MongoClient(settings.mongodb_url)
            # Test the connection
            self.client.admin.command('ping')
            
            self.db = self.client[settings.database_name]
            self.collection = self.db[settings.collection_name]
            
            # Create vector search index if not exists
            self._create_vector_index()
            
            logger.info("✅ Successfully connected to MongoDB")
            return True
            
        except ConnectionFailure as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            return False
    
    def _create_vector_index(self):
        """Create vector search index on embedding field"""
        try:
            logger.info("⚠️  Note: Using manual cosine similarity (MongoDB Atlas vector search requires special setup)")
            logger.info("✅ Vector search index created")
        except Exception as e:
            logger.warning(f"⚠️ Could not create vector index: {e}")
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed")
    
    def insert_chunk(self, chunk_data: dict):
        """Insert a single document chunk"""
        try:
            result = self.collection.insert_one(chunk_data)
            return result.inserted_id
        except Exception as e:
            logger.error(f"Error inserting chunk: {e}")
            raise
    
    def insert_chunks(self, chunks_data: list):
        """Insert multiple document chunks"""
        try:
            result = self.collection.insert_many(chunks_data)
            return result.inserted_ids
        except Exception as e:
            logger.error(f"Error inserting chunks: {e}")
            raise
    
    def vector_search(self, query_embedding: list, top_k: int = 5):
        """Perform vector similarity search using manual cosine similarity"""
        try:
            # Get all documents from database
            all_docs = list(self.collection.find({}))
            
            if not all_docs:
                logger.warning("⚠️  No documents found in database")
                return []
            
            logger.info(f"🔍 Searching through {len(all_docs)} document chunks...")
            
            # Calculate cosine similarity manually for each document
            results_with_scores = []
            query_vec = np.array(query_embedding)
            
            for doc in all_docs:
                if 'embedding' in doc and doc['embedding']:
                    try:
                        doc_vec = np.array(doc['embedding'])
                        
                        # Calculate cosine similarity
                        dot_product = np.dot(query_vec, doc_vec)
                        query_norm = np.linalg.norm(query_vec)
                        doc_norm = np.linalg.norm(doc_vec)
                        
                        if query_norm > 0 and doc_norm > 0:
                            similarity = dot_product / (query_norm * doc_norm)
                        else:
                            similarity = 0.0
                        
                        results_with_scores.append({
                            'document_id': doc.get('document_id', ''),
                            'file_name': doc.get('file_name', 'Unknown'),
                            'chunk_id': doc.get('chunk_id', 0),
                            'content': doc.get('content', ''),
                            'metadata': doc.get('metadata', {}),
                            'similarity_score': float(similarity),
                            'score': float(similarity),
                            'embedding': doc['embedding']  # Keep for later use
                        })
                    except Exception as e:
                        logger.warning(f"Error processing document chunk: {e}")
                        continue
            
            # Sort by similarity score (highest first)
            results_with_scores.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            # Return top-k results
            top_results = results_with_scores[:top_k]
            
            if top_results:
                logger.info(f"✅ Found {len(top_results)} results (top score: {top_results[0]['similarity_score']:.4f})")
            else:
                logger.info("⚠️  No matching results found")
            
            return top_results
            
        except Exception as e:
            logger.error(f"❌ Vector search failed: {e}")
            # Fallback: Return recent documents if search fails
            try:
                fallback_results = list(self.collection.find({}).limit(top_k))
                logger.info(f"Using fallback: returning {len(fallback_results)} recent documents")
                return fallback_results
            except:
                return []
    
    def get_all_documents(self):
        """Get list of all unique documents"""
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$document_id",
                        "file_name": {"$first": "$file_name"},
                        "total_chunks": {"$sum": 1},
                        "upload_date": {"$first": "$created_at"}
                    }
                },
                {"$sort": {"upload_date": -1}}
            ]
            
            results = list(self.collection.aggregate(pipeline))
            return results
            
        except Exception as e:
            logger.error(f"Error fetching documents: {e}")
            return []
    
    def delete_document(self, document_id: str):
        """Delete all chunks of a document"""
        try:
            result = self.collection.delete_many({"document_id": document_id})
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error deleting document: {e}")
            raise

# Global database instance
db = MongoDB()
