"""
Simple Mock Embedding Service for FluxCommerce Testing
This version uses simple word-based embeddings for testing the vector search pipeline
"""
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import logging
import uvicorn
import hashlib
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="FluxCommerce Mock Embedding Service", version="1.0.0")

class EmbeddingRequest(BaseModel):
    text: str

class BatchEmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class BatchEmbeddingResponse(BaseModel):
    embeddings: List[List[float]]

def create_simple_embedding(text: str) -> List[float]:
    """
    Create a simple 384-dimensional embedding based on text characteristics
    This is a mock implementation for testing - not for production use
    """
    # Normalize text
    text = text.lower().strip()
    
    # Create a reproducible seed from text
    seed = int(hashlib.md5(text.encode()).hexdigest()[:8], 16)
    np.random.seed(seed)
    
    # Base random vector
    embedding = np.random.normal(0, 0.1, 384)
    
    # Add semantic features based on keywords
    food_keywords = ['pizza', 'hamburguesa', 'ensalada', 'arroz', 'leche', 'huevos', 'pan', 'croissant', 'comida', 'desayuno', 'almuerzo', 'cena']
    medicine_keywords = ['paracetamol', 'alcohol', 'curitas', 'medicina', 'medicamento', 'dolor', 'cabeza', 'fiebre']
    tech_keywords = ['auriculares', 'mouse', 'teclado', 'tecnología', 'electrónica', 'computadora']
    toy_keywords = ['juguete', 'muñeca', 'carrito', 'rompecabezas', 'niño', 'niña', 'regalo']
    
    # Boost specific dimensions for categories
    if any(keyword in text for keyword in food_keywords):
        embedding[0:50] += 0.3  # Food dimension
    
    if any(keyword in text for keyword in medicine_keywords):
        embedding[50:100] += 0.3  # Medicine dimension
        
    if any(keyword in text for keyword in tech_keywords):
        embedding[100:150] += 0.3  # Tech dimension
        
    if any(keyword in text for keyword in toy_keywords):
        embedding[150:200] += 0.3  # Toy dimension
    
    # Add word-specific patterns
    words = text.split()
    for i, word in enumerate(words):
        if i < 50:  # Use first 50 words
            word_hash = hash(word) % 384
            embedding[word_hash] += 0.2
    
    # Normalize to unit vector
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm
    
    return embedding.tolist()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": True, "model": "mock-simple-embeddings"}

@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for a single text"""
    try:
        embedding = create_simple_embedding(request.text)
        logger.info(f"Generated mock embedding for: '{request.text[:50]}...'")
        return EmbeddingResponse(embedding=embedding)
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise e

@app.post("/embed_batch", response_model=BatchEmbeddingResponse)
async def generate_embeddings_batch(request: BatchEmbeddingRequest):
    """Generate embeddings for multiple texts"""
    try:
        embeddings = [create_simple_embedding(text) for text in request.texts]
        logger.info(f"Generated mock embeddings for {len(request.texts)} texts")
        return BatchEmbeddingResponse(embeddings=embeddings)
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        raise e

@app.post("/embeddings", response_model=BatchEmbeddingResponse)
async def generate_embeddings(request: BatchEmbeddingRequest):
    """Generate embeddings for multiple texts (FluxCommerce backend compatible endpoint)"""
    try:
        embeddings = [create_simple_embedding(text) for text in request.texts]
        logger.info(f"Generated mock embeddings for {len(request.texts)} texts via /embeddings endpoint")
        return BatchEmbeddingResponse(embeddings=embeddings)
    except Exception as e:
        logger.error(f"Error generating embeddings: {e}")
        raise e

@app.get("/")
async def root():
    """Root endpoint with basic info"""
    return {
        "message": "FluxCommerce Mock Embedding Service",
        "model": "simple-word-based-mock",
        "dimensions": 384,
        "note": "This is a testing implementation - semantic similarity is simulated",
        "endpoints": ["/embed", "/embed_batch", "/health"]
    }

if __name__ == "__main__":
    logger.info("Starting FluxCommerce Mock Embedding Service...")
    uvicorn.run(app, host="0.0.0.0", port=8000)