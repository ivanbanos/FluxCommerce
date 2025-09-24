using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Queries
{
    public class GetOrdersByBuyerEmailQuery : IRequest<List<Order>>
    {
        public string Email { get; set; } = null!;
    }
}
