using FluxCommerce.Api.Application.Queries;
using FluxCommerce.Api.Data;
using FluxCommerce.Api.Models;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace FluxCommerce.Api.Application.Handlers
{
    public class GetOrdersByMerchantQueryHandler : IRequestHandler<GetOrdersByMerchantQuery, List<Order>>
    {
        private readonly MongoDbService _mongoDbService;
        public GetOrdersByMerchantQueryHandler(MongoDbService mongoDbService)
        {
            _mongoDbService = mongoDbService;
        }

        public async Task<List<Order>> Handle(GetOrdersByMerchantQuery request, CancellationToken cancellationToken)
        {
            return await _mongoDbService.GetOrdersByMerchantAsync(request.MerchantId);
        }
    }
}
