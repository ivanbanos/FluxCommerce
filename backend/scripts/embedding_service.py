"""
FastAPI Embedding Service for FluxCommerce
Uses sentence-transformers for generating text embeddings
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List
import logging
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="FluxCommerce Embedding Service", version="1.0.0")

# Global model variable
model = None

class EmbeddingRequest(BaseModel):
    text: str

class BatchEmbeddingRequest(BaseModel):
    texts: List[str]

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class BatchEmbeddingResponse(BaseModel):
    embeddings: List[List[float]]

@app.on_event("startup")
async def load_model():
    """Load the sentence transformer model on startup"""
    global model
    try:
        logger.info("Loading sentence transformer model...")
        model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        raise e

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/embed", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    """Generate embedding for a single text"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Generate embedding
        embedding = model.encode(request.text, convert_to_tensor=False)
        
        # Convert to list of floats
        embedding_list = embedding.tolist()
        
        logger.info(f"Generated embedding for text: '{request.text[:50]}...'")
        
        return EmbeddingResponse(embedding=embedding_list)
    
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/embed_batch", response_model=BatchEmbeddingResponse)
async def generate_embeddings_batch(request: BatchEmbeddingRequest):
    """Generate embeddings for multiple texts"""
    if model is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Generate embeddings for all texts
        embeddings = model.encode(request.texts, convert_to_tensor=False)
        
        # Convert to list of lists
        embeddings_list = [emb.tolist() for emb in embeddings]
        
        logger.info(f"Generated embeddings for {len(request.texts)} texts")
        
        return BatchEmbeddingResponse(embeddings=embeddings_list)
    
    except Exception as e:
        logger.error(f"Error generating batch embeddings: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    """Root endpoint with basic info"""
    return {
        "message": "FluxCommerce Embedding Service",
        "model": "sentence-transformers/all-MiniLM-L6-v2",
        "dimensions": 384,
        "endpoints": ["/embed", "/embed_batch", "/health"]
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)