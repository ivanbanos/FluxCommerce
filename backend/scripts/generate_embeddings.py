"""
Generate embeddings for existing products in FluxCommerce MongoDB
"""
import pymongo
import requests
import time
import json
from typing import List, Dict, Any

# MongoDB connection
DB_NAME = "FluxCommerce"
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client[DB_NAME]
products_collection = db["Products"]

# Embedding service configuration
EMBEDDING_SERVICE_URL = "http://localhost:8000"

def create_searchable_text(product: Dict[str, Any]) -> str:
    """
    Create searchable text by combining name, description, and keywords
    """
    parts = []
    
    # Add product name
    name = product.get("Name", "").strip()
    if name:
        parts.append(name)
    
    # Add description
    description = product.get("Description", "").strip()
    if description:
        parts.append(description)
    
    # Add keywords
    keywords = product.get("Keywords", [])
    if keywords and isinstance(keywords, list):
        keyword_text = " ".join([kw for kw in keywords if isinstance(kw, str)])
        if keyword_text.strip():
            parts.append(keyword_text)
    
    return " ".join(parts)

def generate_embedding(text: str) -> List[float]:
    """
    Generate embedding for a single text using the embedding service
    """
    try:
        response = requests.post(
            f"{EMBEDDING_SERVICE_URL}/embed",
            json={"text": text},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["embedding"]
        else:
            print(f"Error from embedding service: {response.status_code}")
            return [0.0] * 384  # Return zero vector on error
    
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return [0.0] * 384  # Return zero vector on error

def generate_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for multiple texts using batch endpoint
    """
    try:
        response = requests.post(
            f"{EMBEDDING_SERVICE_URL}/embed_batch",
            json={"texts": texts},
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json()["embeddings"]
        else:
            print(f"Error from embedding service: {response.status_code}")
            return [[0.0] * 384] * len(texts)  # Return zero vectors on error
    
    except Exception as e:
        print(f"Error generating batch embeddings: {e}")
        return [[0.0] * 384] * len(texts)  # Return zero vectors on error

def check_embedding_service():
    """
    Check if the embedding service is running
    """
    try:
        response = requests.get(f"{EMBEDDING_SERVICE_URL}/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"Embedding service is healthy: {health_data}")
            return True
        else:
            print(f"Embedding service health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Cannot connect to embedding service: {e}")
        print("Please make sure the embedding service is running:")
        print("1. cd backend/scripts")
        print("2. pip install -r requirements.txt")
        print("3. python embedding_service.py")
        return False

def update_product_embeddings(batch_size: int = 10):
    """
    Update all products with embeddings and searchable text
    """
    if not check_embedding_service():
        return False
    
    # Get all non-deleted products
    products = list(products_collection.find({
        "$or": [
            {"IsDeleted": {"$ne": True}},
            {"IsDeleted": {"$exists": False}}
        ]
    }))
    
    print(f"Found {len(products)} products to process")
    
    # Process products in batches
    for i in range(0, len(products), batch_size):
        batch = products[i:i + batch_size]
        
        print(f"Processing batch {i//batch_size + 1}/{(len(products) + batch_size - 1)//batch_size}")
        
        # Prepare texts for batch embedding
        texts = []
        product_updates = []
        
        for product in batch:
            searchable_text = create_searchable_text(product)
            texts.append(searchable_text)
            product_updates.append({
                "id": product["_id"],
                "searchable_text": searchable_text
            })
        
        # Generate embeddings for the batch
        embeddings = generate_embeddings_batch(texts)
        
        # Update each product in the database
        for j, product_update in enumerate(product_updates):
            try:
                products_collection.update_one(
                    {"_id": product_update["id"]},
                    {
                        "$set": {
                            "searchableText": product_update["searchable_text"],
                            "embedding": embeddings[j]
                        }
                    }
                )
                
                # Get product name for logging
                product_name = next((p.get("Name", "Unknown") for p in batch if p["_id"] == product_update["id"]), "Unknown")
                print(f"  ✓ Updated: {product_name}")
                
            except Exception as e:
                print(f"  ✗ Error updating product {product_update['id']}: {e}")
        
        # Small delay between batches to be nice to the embedding service
        if i + batch_size < len(products):
            time.sleep(1)
    
    print("✅ Embedding generation complete!")
    return True

def test_embeddings():
    """
    Test the embedding generation with a few sample products
    """
    print("Testing embeddings...")
    
    # Get a few products to test
    test_products = list(products_collection.find({
        "$or": [
            {"IsDeleted": {"$ne": True}},
            {"IsDeleted": {"$exists": False}}
        ],
        "embedding": {"$exists": True}
    }).limit(3))
    
    if not test_products:
        print("No products with embeddings found")
        return
    
    for product in test_products:
        name = product.get("Name", "Unknown")
        searchable_text = product.get("searchableText", "")
        embedding = product.get("embedding", [])
        
        print(f"\nProduct: {name}")
        print(f"Searchable text: {searchable_text}")
        print(f"Embedding dimensions: {len(embedding)}")
        print(f"Embedding sample: {embedding[:5]}...")

def main():
    """
    Main function - generate embeddings for all products
    """
    print("🚀 FluxCommerce Embedding Generator")
    print("=" * 50)
    
    # Check if we should update embeddings
    choice = input("Generate embeddings for all products? (y/n): ").lower().strip()
    
    if choice == 'y':
        success = update_product_embeddings()
        if success:
            test_embeddings()
    else:
        print("Skipping embedding generation")
    
    print("\nDone!")

if __name__ == "__main__":
    main()