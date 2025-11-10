# Vector Search Implementation for FluxCommerce Chat

## Overview
Implement semantic vector search to improve product discovery in the chat system. The goal is to search not only by product names but also descriptions, split queries into individual words, and return intelligently ranked results.

## Current State vs Target State

### Current Implementation
- Simple string matching on product names only
- Searches for exact query match
- Returns all matching products or nothing
- Limited semantic understanding

### Target Implementation
- Vector embeddings for products (name + description)
- Word-by-word query processing
- Semantic similarity matching
- Intelligent result ranking and filtering
- Context-aware responses (single best match vs multiple options)

## Implementation Steps

### Phase 1: MongoDB Vector Search Setup

#### 1.1 MongoDB Atlas Vector Search Index
```javascript
// Create vector search index in MongoDB Atlas
{
  "fields": [
    {
      "type": "vector",
      "path": "embedding",
      "numDimensions": 384,  // For sentence-transformers/all-MiniLM-L6-v2
      "similarity": "cosine"
    },
    {
      "type": "filter", 
      "path": "StoreId"
    },
    {
      "type": "filter",
      "path": "IsDeleted"
    }
  ]
}
```

#### 1.2 Alternative: MongoDB Community with Vector Extensions
- Install MongoDB with vector search capabilities
- Configure local vector indexing
- Set up similarity search functions

### Phase 2: Embedding Model Integration

#### 2.1 Choose Embedding Model
**Option A: Azure OpenAI Embeddings**
```csharp
// Add to Program.cs
builder.Services.AddAzureOpenAIEmbeddings(
    modelId: "text-embedding-ada-002",
    endpoint: "https://your-resource.openai.azure.com/",
    apiKey: "your-api-key"
);
```

**Option B: Local Sentence Transformers (Recommended)**
```csharp
// Use ML.NET with ONNX models or HTTP service
// Model: sentence-transformers/all-MiniLM-L6-v2
// Dimensions: 384
// Fast, free, and works offline
```

**Option C: Semantic Kernel Embeddings**
```csharp
// Already integrated with Semantic Kernel
builder.Services.AddKernel()
    .AddOpenAITextEmbeddingGeneration(
        modelId: "text-embedding-ada-002",
        apiKey: "your-key"
    );
```

#### 2.2 Embedding Service Implementation
```csharp
// backend/Services/IEmbeddingService.cs
public interface IEmbeddingService
{
    Task<float[]> GenerateEmbeddingAsync(string text);
    Task<List<float[]>> GenerateEmbeddingsAsync(List<string> texts);
}

// backend/Services/EmbeddingService.cs
public class EmbeddingService : IEmbeddingService
{
    private readonly IKernel _kernel;
    
    public async Task<float[]> GenerateEmbeddingAsync(string text)
    {
        // Generate embeddings using chosen model
        var embeddingGenerator = _kernel.GetRequiredService<ITextEmbeddingGenerationService>();
        var embedding = await embeddingGenerator.GenerateEmbeddingAsync(text);
        return embedding.ToArray();
    }
}
```

### Phase 3: Product Data Enhancement

#### 3.1 Add Embedding Field to Product Model
```csharp
// backend/Models/Product.cs
public class Product
{
    [BsonElement("_id")]
    public string Id { get; set; }
    
    [BsonElement("Name")]
    public string Name { get; set; }
    
    [BsonElement("Description")]
    public string Description { get; set; }
    
    [BsonElement("Price")]
    public decimal Price { get; set; }
    
    // New field for vector search
    [BsonElement("embedding")]
    public float[] Embedding { get; set; } = new float[384];
    
    [BsonElement("searchableText")]
    public string SearchableText { get; set; } // name + description combined
    
    // ... other existing fields
}
```

#### 3.2 Product Embedding Generation Script
```python
# backend/scripts/generate_embeddings.py
import pymongo
from sentence_transformers import SentenceTransformer
import numpy as np

# Load model
model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')

# Connect to MongoDB
client = pymongo.MongoClient("mongodb://localhost:27017/")
db = client["FluxCommerce"]
products_collection = db["Products"]

def generate_searchable_text(name, description):
    """Combine name and description for embedding"""
    text_parts = [name]
    if description and description.strip():
        text_parts.append(description.strip())
    return " ".join(text_parts)

def update_product_embeddings():
    """Update all products with embeddings"""
    products = products_collection.find({"IsDeleted": {"$ne": True}})
    
    for product in products:
        name = product.get("Name", "")
        description = product.get("Description", "")
        
        # Create searchable text
        searchable_text = generate_searchable_text(name, description)
        
        # Generate embedding
        embedding = model.encode(searchable_text)
        
        # Update product
        products_collection.update_one(
            {"_id": product["_id"]},
            {
                "$set": {
                    "searchableText": searchable_text,
                    "embedding": embedding.tolist()
                }
            }
        )
        
        print(f"Updated: {name}")

if __name__ == "__main__":
    update_product_embeddings()
    print("All product embeddings updated!")
```

### Phase 4: Enhanced Search Service

#### 4.1 Vector Search Repository
```csharp
// backend/Services/IVectorSearchService.cs
public interface IVectorSearchService
{
    Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, int limit = 10);
    Task<float[]> GenerateQueryEmbeddingAsync(string query);
}

public class ProductSearchResult
{
    public Product Product { get; set; }
    public double SimilarityScore { get; set; }
    public List<string> MatchingTerms { get; set; }
}

// backend/Services/VectorSearchService.cs
public class VectorSearchService : IVectorSearchService
{
    private readonly MongoDbService _mongoDbService;
    private readonly IEmbeddingService _embeddingService;
    
    public async Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, int limit = 10)
    {
        // 1. Generate embedding for query
        var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(query);
        
        // 2. Perform vector search in MongoDB
        var results = await PerformVectorSearchAsync(queryEmbedding, storeId, limit * 2);
        
        // 3. Apply additional scoring and filtering
        var scoredResults = await EnhanceResultsWithKeywordScoring(results, query);
        
        // 4. Return top results
        return scoredResults.Take(limit).ToList();
    }
    
    private async Task<List<Product>> PerformVectorSearchAsync(float[] queryEmbedding, string storeId, int limit)
    {
        // MongoDB Atlas Vector Search
        var pipeline = new[]
        {
            new BsonDocument("$vectorSearch", new BsonDocument
            {
                {"index", "product_embeddings"},
                {"path", "embedding"},
                {"queryVector", new BsonArray(queryEmbedding)},
                {"numCandidates", limit * 5},
                {"limit", limit},
                {"filter", new BsonDocument
                {
                    {"StoreId", storeId},
                    {"IsDeleted", new BsonDocument("$ne", true)}
                }}
            }),
            new BsonDocument("$addFields", new BsonDocument
            {
                {"similarityScore", new BsonDocument("$meta", "vectorSearchScore")}
            })
        };
        
        var collection = _mongoDbService.GetProductCollection();
        var results = await collection.Aggregate<Product>(pipeline).ToListAsync();
        return results;
    }
    
    private async Task<List<ProductSearchResult>> EnhanceResultsWithKeywordScoring(List<Product> vectorResults, string query)
    {
        var queryWords = query.ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 2) // Ignore very short words
            .ToList();
            
        var enhancedResults = new List<ProductSearchResult>();
        
        foreach (var product in vectorResults)
        {
            var matchingTerms = new List<string>();
            var keywordScore = 0.0;
            
            // Check for exact word matches in name and description
            var searchableText = $"{product.Name} {product.Description}".ToLower();
            
            foreach (var word in queryWords)
            {
                if (searchableText.Contains(word))
                {
                    matchingTerms.Add(word);
                    // Boost score for name matches vs description matches
                    if (product.Name.ToLower().Contains(word))
                        keywordScore += 2.0;
                    else
                        keywordScore += 1.0;
                }
            }
            
            // Combine vector similarity with keyword matching
            var combinedScore = (product.SimilarityScore * 0.7) + (keywordScore * 0.3);
            
            enhancedResults.Add(new ProductSearchResult
            {
                Product = product,
                SimilarityScore = combinedScore,
                MatchingTerms = matchingTerms
            });
        }
        
        return enhancedResults.OrderByDescending(r => r.SimilarityScore).ToList();
    }
}
```

### Phase 5: Intelligent Response Generation

#### 4.2 Enhanced Chat Service
```csharp
// backend/Services/ChatService.cs - Update SearchProductsAsync
public async Task<List<Product>> SearchProductsAsync(string query, string storeId)
{
    // Use vector search instead of simple text search
    var searchResults = await _vectorSearchService.SearchProductsAsync(query, storeId);
    
    // Apply intelligent filtering
    return FilterAndRankResults(searchResults, query);
}

private List<Product> FilterAndRankResults(List<ProductSearchResult> results, string query)
{
    if (!results.Any()) return new List<Product>();
    
    var topResult = results.First();
    var topScore = topResult.SimilarityScore;
    
    // If we have a clear winner (significantly better than others)
    if (results.Count == 1 || topScore > results[1].SimilarityScore * 1.5)
    {
        return new List<Product> { topResult.Product };
    }
    
    // If we have multiple good candidates, return top 5
    var threshold = topScore * 0.8;
    return results
        .Where(r => r.SimilarityScore >= threshold)
        .Take(5)
        .Select(r => r.Product)
        .ToList();
}
```

#### 4.3 Smart Response Templates
```csharp
// Update ProcessAIResponse to handle different result scenarios
private async Task ProcessAIResponse(string response, string userId, string storeId)
{
    // ... existing code ...
    
    switch (action?.ToLower())
    {
        case "search_products":
            var products = await SearchProductsAsync(aiResponse.Query ?? "", storeId);
            
            if (products.Count == 0)
            {
                // No results - ask clarifying question
                await SendSuggestiveResponse(userId, aiResponse.Query);
            }
            else if (products.Count == 1)
            {
                // Single best match - direct recommendation
                await SendSingleProductResponse(userId, products[0], aiResponse.Query);
            }
            else
            {
                // Multiple options - present table
                await SendMultipleProductsResponse(userId, products, aiResponse.Query);
            }
            break;
    }
}

private async Task SendSuggestiveResponse(string userId, string query)
{
    var suggestions = await GenerateSearchSuggestions(query);
    var message = $"No encontré productos para '{query}'. ¿Te refieres a alguno de estos: {string.Join(", ", suggestions)}?";
    
    await _hubContext.Clients.Group(userId).SendCoreAsync("ReceiveMessage", new object[] 
    { 
        new { text = message, timestamp = DateTime.UtcNow } 
    });
}
```

### Phase 6: Enhanced System Prompt

#### 6.1 Update Chat Prompt
```text
# backend/Services/Prompts/chat_prompt.txt

Eres un asistente de compras inteligente para FluxCommerce. Tu objetivo es ayudar a los usuarios a encontrar productos usando búsqueda semántica avanzada.

CAPACIDADES DE BÚSQUEDA:
- Búsqueda por palabras individuales en nombres y descripciones
- Comprensión semántica de consultas (ej: "comida" puede encontrar "pizza", "pasta")  
- Ranking inteligente de resultados por relevancia

TIPOS DE RESPUESTA:
1. PRODUCTO ÚNICO (alta confianza):
   - Recomienda directamente el producto más relevante
   - Incluye detalles completos y opción de agregar al carrito

2. MÚLTIPLES OPCIONES (varios candidatos similares):
   - Presenta tabla comparativa con 3-5 productos
   - Permite al usuario elegir o refinar búsqueda

3. SIN RESULTADOS:
   - Sugiere términos relacionados o categorías
   - Hace preguntas para clarificar la búsqueda

FORMATO DE RESPUESTA JSON:
{
  "Action": "search_products|clarify_search|single_recommendation|multiple_options",
  "Query": "términos de búsqueda procesados",
  "Message": "mensaje contextual para el usuario",
  "Products": [...], // solo si Action es search_products
  "Suggestions": [...] // solo si Action es clarify_search
}

Ejemplos:
Usuario: "necesito algo para cocinar pasta"
Respuesta: Buscar products relacionados con "pasta cocinar ingredientes salsa"

Usuario: "quiero medicamento para dolor"  
Respuesta: Buscar products relacionados con "medicamento analgésico dolor paracetamol ibuprofeno"
```

### Phase 7: Testing and Optimization

#### 7.1 Test Cases
```csharp
// Create comprehensive test cases
var testQueries = new[]
{
    "huevos", // Exact match
    "comida para desayuno", // Semantic search
    "algo para el dolor de cabeza", // Medical search
    "juguete niños", // Category search
    "regalo cumpleaños mujer", // Intent-based search
    "barato económico", // Price-based search
};
```

#### 7.2 Performance Monitoring
```csharp
// Add metrics for search quality
public class SearchMetrics
{
    public string Query { get; set; }
    public int ResultsCount { get; set; }
    public double TopScore { get; set; }
    public double AverageScore { get; set; }
    public TimeSpan SearchTime { get; set; }
    public bool UserInteracted { get; set; } // Did user click/add to cart?
}
```

### Phase 8: Future Enhancements

#### 8.1 User Learning
- Track user interactions to improve recommendations
- Personal preference learning
- Popular products boosting

#### 8.2 Advanced Features
- Image-based search using vision models
- Voice search integration
- Multi-language support
- Real-time inventory consideration

#### 8.3 Performance Optimizations
- Embedding caching strategies
- Incremental index updates
- Query result caching
- A/B testing for search algorithms

## Implementation Priority

### High Priority (Phase 1-3)
1. Set up MongoDB vector search index
2. Integrate embedding service (local model recommended)
3. Generate embeddings for existing products
4. Basic vector search implementation

### Medium Priority (Phase 4-5)
1. Enhanced search service with keyword + vector scoring
2. Intelligent result filtering and ranking
3. Smart response generation based on result confidence

### Low Priority (Phase 6-8)
1. Advanced prompt engineering
2. Comprehensive testing suite
3. Performance monitoring and optimization
4. Future enhancements

## Estimated Timeline
- **Setup and Basic Implementation**: 2-3 days
- **Enhanced Search Logic**: 1-2 days  
- **Testing and Optimization**: 1-2 days
- **Total**: 4-7 days

## Dependencies
- MongoDB Atlas (for vector search) OR local MongoDB with vector extensions
- Sentence Transformers model OR OpenAI embeddings
- Python environment for embedding generation
- Additional storage for embeddings (~1.5KB per product)

## Success Metrics
- Improved search relevance (user clicks on results)
- Reduced "no results" responses
- Higher cart conversion from chat recommendations
- Better handling of ambiguous or broad queries