using FluxCommerce.Api.Models;
using MongoDB.Driver;

namespace FluxCommerce.Api.Services;

public class ProductSearchResult
{
    public Product Product { get; set; } = new();
    public double SimilarityScore { get; set; }
    public List<string> MatchingTerms { get; set; } = new();
}

public interface IVectorSearchService
{
    Task<List<ProductSearchResult>> SearchProductsAsync(string query, string storeId, int limit = 10);
    Task<List<Product>> GetSimilarProductsAsync(string productId, string storeId, int limit = 5);
}