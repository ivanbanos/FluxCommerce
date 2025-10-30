using MediatR;
using FluxCommerce.Api.Models;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetOrdersByMerchantQuery : IRequest<List<Order>>
    {
    public string StoreId { get; set; } = null!;
    }
}
