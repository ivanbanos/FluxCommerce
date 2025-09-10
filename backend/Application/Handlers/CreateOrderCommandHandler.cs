using FluxCommerce.Api.Application.Commands;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, string>
    {
        private readonly MongoDbService _mongoDbService;
        public CreateOrderCommandHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<string> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
        {
            var order = new Order
            {
                BuyerName = request.BuyerName,
                BuyerEmail = request.BuyerEmail,
                MerchantId = request.MerchantId,
                Total = request.Total,
                Products = new System.Collections.Generic.List<OrderProduct>(),
                CreatedAt = System.DateTime.UtcNow,
                Status = "pendiente"
            };
            foreach (var p in request.Products)
            {
                order.Products.Add(new OrderProduct
                {
                    ProductId = p.ProductId,
                    Name = p.Name,
                    Price = p.Price,
                    Qty = p.Qty
                });
            }
            await _mongoDbService.InsertOrderAsync(order);
            return order.Id!;
        }
    }
}
