using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MongoDB.Driver;

namespace FluxCommerce.Api.Services;

public class VectorSearchService : IVectorSearchService
{
    private readonly MongoDbService _mongoDbService;
    private readonly IEmbeddingService _embeddingService;
    private readonly ILogger<VectorSearchService> _logger;

    public VectorSearchService(
        MongoDbService mongoDbService, 
        IEmbeddingService embeddingService,
        ILogger<VectorSearchService> logger)
    {
        _mongoDbService = mongoDbService;
        _embeddingService = embeddingService;
        _logger = logger;
    }

    public async Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, int limit = 10)
    {
        try
        {
            // Generate embedding for the search query
            var queryEmbedding = await _embeddingService.GenerateEmbeddingAsync(query);
            
            _logger.LogInformation("Generated embedding for query: {Query}", query);
            
            // Get all products from the store (for now, we'll do simple similarity calculation)
            // In production, you'd want to use MongoDB Atlas Vector Search or similar
            var products = await GetStoreProductsWithEmbeddings(storeId);
            
            // Calculate similarities and rank results
            var searchResults = new List<ProductSearchResult>();
            
            foreach (var product in products)
            {
                if (product.Embedding == null || product.Embedding.Length == 0)
                {
                    continue; // Skip products without embeddings
                }
                
                // Calculate cosine similarity
                var similarity = _embeddingService.CalculateCosineSimilarity(queryEmbedding, product.Embedding);
                
                // Also check for keyword matches to boost score
                var keywordScore = CalculateKeywordScore(query, product);
                
                // Combine vector similarity with keyword matching (70% vector, 30% keywords)
                var combinedScore = (similarity * 0.7) + (keywordScore * 0.3);
                
                searchResults.Add(new ProductSearchResult
                {
                    Product = product,
                    SimilarityScore = combinedScore,
                    MatchingTerms = GetMatchingTerms(query, product)
                });
            }
            
            // Sort by similarity score and return top results
            var topResults = searchResults
                .Where(r => r.SimilarityScore > 0.1) // Filter out very low similarity
                .OrderByDescending(r => r.SimilarityScore)
                .Take(limit)
                .ToList();
                
            _logger.LogInformation("Found {Count} products for query '{Query}' in store {StoreId}", 
                topResults.Count, query, storeId);
                
            return topResults;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products with query: {Query}", query);
            return new List<ProductSearchResult>();
        }
    }

    public async Task<List<Product>> GetSimilarProductsAsync(string productId, string storeId, int limit = 5)
    {
        try
        {
            // Get the reference product
            var referenceProduct = await _mongoDbService.GetProductByIdAsync(productId);
            if (referenceProduct == null || referenceProduct.Embedding == null)
            {
                return new List<Product>();
            }
            
            // Get all other products from the store
            var products = await GetStoreProductsWithEmbeddings(storeId);
            
            // Calculate similarities
            var similarities = new List<(Product Product, double Similarity)>();
            
            foreach (var product in products)
            {
                if (product.Id == productId || product.Embedding == null || product.Embedding.Length == 0)
                {
                    continue; // Skip the reference product itself and products without embeddings
                }
                
                var similarity = _embeddingService.CalculateCosineSimilarity(referenceProduct.Embedding, product.Embedding);
                similarities.Add((product, similarity));
            }
            
            // Return top similar products
            return similarities
                .OrderByDescending(s => s.Similarity)
                .Take(limit)
                .Select(s => s.Product)
                .ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding similar products for product: {ProductId}", productId);
            return new List<Product>();
        }
    }

    private async Task<List<Product>> GetStoreProductsWithEmbeddings(string storeId)
    {
        var filter = Builders<Product>.Filter.And(
            Builders<Product>.Filter.Eq(p => p.StoreId, storeId),
            Builders<Product>.Filter.Ne(p => p.IsDeleted, true),
            Builders<Product>.Filter.Exists(p => p.Embedding)
        );
        
        var products = await _mongoDbService.GetProductCollection()
            .Find(filter)
            .ToListAsync();
            
        return products;
    }

    private double CalculateKeywordScore(string query, Product product)
    {
        var queryWords = query.ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 2) // Ignore very short words
            .ToList();
            
        if (!queryWords.Any())
        {
            return 0.0;
        }
        
        var searchableText = $"{product.Name} {product.Description}".ToLower();
        var matchingWords = 0;
        
        foreach (var word in queryWords)
        {
            if (searchableText.Contains(word))
            {
                matchingWords++;
                
                // Boost score for exact matches in product name
                if (product.Name?.ToLower().Contains(word) == true)
                {
                    matchingWords++; // Double weight for name matches
                }
            }
        }
        
        // Return score as percentage of matching words
        return (double)matchingWords / queryWords.Count;
    }

    private List<string> GetMatchingTerms(string query, Product product)
    {
        var queryWords = query.ToLower()
            .Split(' ', StringSplitOptions.RemoveEmptyEntries)
            .Where(w => w.Length > 2)
            .ToList();
            
        var searchableText = $"{product.Name} {product.Description}".ToLower();
        var matchingTerms = new List<string>();
        
        foreach (var word in queryWords)
        {
            if (searchableText.Contains(word))
            {
                matchingTerms.Add(word);
            }
        }
        
        return matchingTerms;
    }
}