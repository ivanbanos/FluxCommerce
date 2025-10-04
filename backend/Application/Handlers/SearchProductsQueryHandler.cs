using MediatR;
using FluxCommerce.Api.Application.Queries;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;

namespace FluxCommerce.Api.Application.Handlers;

public class SearchProductsQueryHandler : IRequestHandler<SearchProductsQuery, List<Product>>
{
    private readonly MongoDbService _mongoDbService;

    public SearchProductsQueryHandler(MongoDbService mongoDbService)
    {
        _mongoDbService = mongoDbService;
    }

    public async Task<List<Product>> Handle(SearchProductsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            Console.WriteLine($"🔍 HANDLER DEBUG: Received search request - SearchTerm: '{request.SearchTerm}', StoreId: '{request.StoreId}'");
            Console.WriteLine($"🔍 HANDLER DEBUG: About to call _mongoDbService.SearchProductsAsync()");

            var products = await _mongoDbService.SearchProductsAsync(request.SearchTerm, request.StoreId);

            Console.WriteLine($"📦 HANDLER DEBUG: MongoDbService returned {products.Count} products");

            return products;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"💥 HANDLER DEBUG: Exception in SearchProductsQueryHandler: {ex.Message}");
            Console.WriteLine($"💥 HANDLER DEBUG: Stack trace: {ex.StackTrace}");
            Console.WriteLine($"💥 HANDLER DEBUG: Inner exception: {ex.InnerException?.Message}");
            return new List<Product>();
        }
    }
}