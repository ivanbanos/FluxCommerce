using FluxCommerce.Api.Application.Queries;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class GetOrdersByBuyerEmailQueryHandler : IRequestHandler<GetOrdersByBuyerEmailQuery, List<Order>>
    {
        private readonly MongoDbService _mongoDbService;
        public GetOrdersByBuyerEmailQueryHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<List<Order>> Handle(GetOrdersByBuyerEmailQuery request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.GetOrdersByBuyerEmailAsync(request.Email);
        }
    }
}
