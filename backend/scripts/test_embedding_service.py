#!/usr/bin/env python3

import requests
import json

def test_embedding_service():
    url = "http://localhost:8000/embeddings"
    
    test_data = {
        "texts": ["medicina para dolor", "comida para desayuno"]
    }
    
    try:
        response = requests.post(url, json=test_data)
        
        if response.status_code == 200:
            embeddings = response.json()
            print("✅ Embedding Service Test PASSED!")
            print(f"Generated {len(embeddings['embeddings'])} embeddings")
            print(f"Each embedding has {len(embeddings['embeddings'][0])} dimensions")
            return True
        else:
            print(f"❌ Error: {response.status_code} - {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to embedding service. Make sure it's running on port 8000")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

if __name__ == "__main__":
    print("Testing FluxCommerce Embedding Service...")
    test_embedding_service()