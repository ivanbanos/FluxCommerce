using MediatR;
using FluxCommerce.Api.Models;

namespace FluxCommerce.Api.Application.Queries;

public class SearchProductsQuery : IRequest<List<Product>>
{
    public string SearchTerm { get; set; } = string.Empty;
    public string StoreId { get; set; } = string.Empty;
}