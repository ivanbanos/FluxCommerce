# Vector Search Setup and Testing Guide

## Quick Setup Steps

### 1. Start the Embedding Service

```powershell
# Navigate to scripts directory
cd backend\scripts

# Install Python dependencies (first time only)
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start the embedding service
python embedding_service.py
```

The service will be available at `http://localhost:8000`

### 2. Generate Embeddings for Existing Products

In a new terminal window:

```powershell
cd backend\scripts
venv\Scripts\activate
python generate_embeddings.py
```

Follow the prompts to generate embeddings for all products.

### 3. Start the Backend

```powershell
# From the main directory
dotnet run --project backend\FluxCommerce.Api.csproj
```

### 4. Start the Frontend

```powershell
npm start --prefix frontend
```

## Testing the Vector Search

### 1. Basic Functionality Test

Open the chat page and try these queries:

**Exact matches:**
- "huevos" → Should find "Huevos" product
- "pizza" → Should find "Pizza" product

**Semantic searches:**
- "comida para desayuno" → Should find eggs, bread, milk
- "medicamento para dolor" → Should find "Paracetamol"
- "algo para mascotas" → Should find pet food, toys
- "productos baratos" → Should find low-price items
- "regalo para niños" → Should find toys, books

**Word-by-word searches:**
- "comida italiana pasta" → Should find pizza and related items
- "medicina dolor cabeza" → Should find paracetamol and related drugs

### 2. Verify Vector Search is Working

Check the backend console logs. You should see:
```
🔎 DEBUG: Starting VECTOR product search with query: 'huevos', storeId: '...'
📦 DEBUG: Vector search returned 1 products
   🎯 Huevos: Score=0.876, Terms=[huevos]
```

If you see fallback messages, the vector search isn't working:
```
💥 DEBUG: Error in SearchProductsAsync (vector): ...
🔄 DEBUG: Falling back to traditional search...
```

### 3. Test Different Result Scenarios

**Single best match (high confidence):**
- Query: "huevos"
- Expected: Single product recommendation

**Multiple good options:**
- Query: "comida"
- Expected: Multiple food products with similar scores

**No results:**
- Query: "xyzabc123"
- Expected: Helpful suggestion message

## Troubleshooting

### Embedding Service Not Starting

```bash
# Check if Python is installed
python --version

# Check if all dependencies are installed
pip list

# Try starting with verbose logging
python embedding_service.py --log-level debug
```

### Vector Search Returning Empty Results

1. **Check if embeddings were generated:**
   ```javascript
   // In MongoDB shell
   use FluxCommerce
   db.Products.find({"embedding": {$exists: true}}).count()
   ```

2. **Check embedding service connectivity:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Check backend logs for errors:**
   Look for embedding service connection errors in the .NET console.

### Performance Issues

1. **Reduce embedding dimensions** (if needed):
   - Change model from `all-MiniLM-L6-v2` (384 dims) to `all-MiniLM-L12-v1` (256 dims)

2. **Implement result caching:**
   - Cache embeddings for common queries
   - Use Redis for distributed caching

3. **Optimize MongoDB queries:**
   - Add indexes on StoreId and IsDeleted fields
   - Consider MongoDB Atlas Vector Search for production

## Production Considerations

### 1. MongoDB Atlas Vector Search

For production, replace the similarity calculation with MongoDB Atlas Vector Search:

```javascript
// Create vector search index in MongoDB Atlas
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,
      "similarity": "cosine"
    },
    {
      "type": "filter", 
      "path": "StoreId"
    }
  ]
}
```

### 2. Embedding Service Scaling

- Deploy embedding service to cloud (Azure Container Instances, AWS ECS)
- Use managed embedding services (Azure OpenAI, AWS Bedrock)
- Implement request batching and caching

### 3. Monitoring and Analytics

Track search quality metrics:
- Click-through rates on search results
- Cart additions from chat recommendations
- User query satisfaction scores

### 4. Model Updates

- Regularly retrain/update embedding model
- A/B test different similarity thresholds
- Monitor search quality over time

## Current Implementation Status

✅ **Completed:**
- Embedding service with sentence-transformers
- Vector search with cosine similarity
- Keyword boosting (70% vector + 30% keywords)
- Fallback to traditional search
- Integration with existing chat system

🚧 **Future Enhancements:**
- MongoDB Atlas Vector Search integration
- Query result caching
- Advanced result ranking algorithms
- Multi-language support
- Image-based product search