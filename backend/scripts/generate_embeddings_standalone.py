"""
Generate embeddings for existing products in FluxCommerce MongoDB
Standalone version with embedded mock embedding logic
"""
import pymongo
import hashlib
import numpy as np
from typing import List, Dict, Any

# MongoDB connection
DB_NAME = "FluxCommerce"
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client[DB_NAME]
products_collection = db["Products"]

def create_simple_embedding(text: str) -> List[float]:
    """
    Create a simple 384-dimensional embedding based on text characteristics
    This is the same mock implementation from the embedding service
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
    
    # Add keywords (if they exist)
    keywords = product.get("Keywords", [])
    if keywords and isinstance(keywords, list):
        keyword_text = " ".join([kw for kw in keywords if isinstance(kw, str)])
        if keyword_text.strip():
            parts.append(keyword_text)
    
    return " ".join(parts)

def update_product_embeddings():
    """
    Update all products with embeddings and searchable text
    """
    # Get all non-deleted products
    products = list(products_collection.find({
        "$or": [
            {"IsDeleted": {"$ne": True}},
            {"IsDeleted": {"$exists": False}}
        ]
    }))
    
    print(f"Found {len(products)} products to process")
    
    updated_count = 0
    
    for i, product in enumerate(products):
        try:
            # Create searchable text
            searchable_text = create_searchable_text(product)
            
            # Generate embedding
            embedding = create_simple_embedding(searchable_text)
            
            # Update product in database
            products_collection.update_one(
                {"_id": product["_id"]},
                {
                    "$set": {
                        "searchableText": searchable_text,
                        "embedding": embedding
                    }
                }
            )
            
            product_name = product.get("Name", "Unknown")
            print(f"  ✓ ({i+1}/{len(products)}) Updated: {product_name}")
            updated_count += 1
            
        except Exception as e:
            product_name = product.get("Name", "Unknown")
            print(f"  ✗ Error updating {product_name}: {e}")
    
    print(f"✅ Embedding generation complete! Updated {updated_count} products.")
    return updated_count > 0

def test_embeddings():
    """
    Test the embedding generation with a few sample products
    """
    print("\nTesting embeddings...")
    
    # Get a few products to test
    test_products = list(products_collection.find({
        "$or": [
            {"IsDeleted": {"$ne": True}},
            {"IsDeleted": {"$exists": False}}
        ],
        "embedding": {"$exists": True}
    }).limit(5))
    
    if not test_products:
        print("No products with embeddings found")
        return
    
    for product in test_products:
        name = product.get("Name", "Unknown")
        searchable_text = product.get("searchableText", "")
        embedding = product.get("embedding", [])
        
        print(f"\n📦 Product: {name}")
        print(f"🔍 Searchable text: {searchable_text[:100]}{'...' if len(searchable_text) > 100 else ''}")
        print(f"🧮 Embedding dimensions: {len(embedding)}")
        print(f"🔢 Embedding sample: [{', '.join([f'{x:.3f}' for x in embedding[:5]])}...]")

def main():
    """
    Main function - generate embeddings for all products
    """
    print("🚀 FluxCommerce Standalone Embedding Generator")
    print("=" * 50)
    print("Using embedded mock embedding logic (same as mock_embedding_service.py)")
    print()
    
    try:
        # Check MongoDB connection
        client.admin.command('ping')
        print("✅ MongoDB connection successful")
        
        # Generate embeddings
        print("\n🔄 Generating embeddings for all products...")
        success = update_product_embeddings()
        
        if success:
            print("\n🧪 Testing a few embeddings...")
            test_embeddings()
            
            print("\n✅ All done! Your products now have vector embeddings.")
            print("You can now test the vector search functionality in the chat!")
        else:
            print("\n❌ No products were updated.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\nMake sure MongoDB is running and accessible at mongodb://localhost:27017/")
    
    print("\nDone!")

if __name__ == "__main__":
    main()