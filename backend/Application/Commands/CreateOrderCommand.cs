using MediatR;
using System.Collections.Generic;

namespace FluxCommerce.Api.Application.Commands
{
    public class CreateOrderCommand : IRequest<string>
    {
        public string? BuyerName { get; set; }
        public string? BuyerEmail { get; set; }
        public string? MerchantId { get; set; }
        public List<OrderProductDto> Products { get; set; } = new();
        public decimal Total { get; set; }
    }

    public class OrderProductDto
    {
        public string? ProductId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public int Qty { get; set; }
    }
}
